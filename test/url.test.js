import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createApp } from "../src/app.js";
import { db } from "../src/db.js";

async function resetDatabase() {
  const schema = readFileSync(
    new URL("../db/schemas.sql", import.meta.url),
    "utf8",
  );
  await db.query(schema);
}

function createTestClient() {
  const app = createApp();
  const server = createServer(app);

  return {
    server,
    async request(path, init = {}) {
      const baseUrl = `http://127.0.0.1:${server.address().port}`;
      const response = await fetch(new URL(path, baseUrl), init);
      const text = await response.text();
      return {
        status: response.status,
        headers: response.headers,
        text,
        json: () => JSON.parse(text),
      };
    },
  };
}

test.beforeEach(async () => {
  await resetDatabase();
});

test.after(async () => {
  await db.end();
});

test("creates a short link and redirects to the target", async () => {
  const client = createTestClient();
  await new Promise((resolve) => client.server.listen(0, resolve));

  try {
    const createResponse = await client.request("/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_url: "https://example.com",
        code: "abc123",
      }),
    });

    assert.equal(createResponse.status, 201);
    const payload = await createResponse.json();
    assert.equal(payload.code, "abc123");

    const redirectResponse = await client.request("/abc123", {
      redirect: "manual",
    });

    assert.equal(redirectResponse.status, 302);
    assert.equal(
      redirectResponse.headers.get("location"),
      "https://example.com",
    );

    const metadataResponse = await client.request("/links/abc123");
    assert.equal(metadataResponse.status, 200);
    const metadata = await metadataResponse.json();
    assert.equal(metadata.click_count, 1);
  } finally {
    await new Promise((resolve, reject) =>
      client.server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("returns 410 for expired links and supports keyset pagination and CSV export", async () => {
  const client = createTestClient();
  await new Promise((resolve) => client.server.listen(0, resolve));

  try {
    const createResponse = await client.request("/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_url: "https://example.com",
        code: "exp123",
        expires_at: "2000-01-01T00:00:00.000Z",
      }),
    });

    assert.equal(createResponse.status, 201);

    const expiredResponse = await client.request("/exp123", {
      redirect: "manual",
    });
    assert.equal(expiredResponse.status, 410);

    const createClicks = await client.request("/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_url: "https://example.org",
        code: "log123",
      }),
    });
    assert.equal(createClicks.status, 201);

    for (const referrer of [
      "https://a.com",
      "https://b.com",
      "https://c.com",
    ]) {
      const redirectResponse = await client.request("/log123", {
        redirect: "manual",
        headers: { referer: referrer },
      });
      assert.equal(redirectResponse.status, 302);
    }

    const clicksResponse = await client.request("/links/log123/clicks?limit=2");
    assert.equal(clicksResponse.status, 200);
    const clicksPayload = await clicksResponse.json();
    assert.equal(clicksPayload.items.length, 2);
    assert.ok(clicksPayload.next_cursor);

    const csvResponse = await client.request("/links/log123/clicks.csv");
    assert.equal(csvResponse.status, 200);
    assert.match(csvResponse.text, /clicked_at/);
    assert.match(csvResponse.text, /referrer/);
  } finally {
    await new Promise((resolve, reject) =>
      client.server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});

test("increments clicks atomically under concurrent redirects and rejects injection attempts", async () => {
  const client = createTestClient();
  await new Promise((resolve) => client.server.listen(0, resolve));

  try {
    const createResponse = await client.request("/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_url: "https://example.net",
        code: "concurrent",
      }),
    });
    assert.equal(createResponse.status, 201);

    const requests = Array.from({ length: 8 }, () =>
      client.request("/concurrent", { redirect: "manual" }),
    );
    const responses = await Promise.all(requests);
    assert.ok(responses.every((response) => response.status === 302));

    const metadataResponse = await client.request("/links/concurrent");
    assert.equal(metadataResponse.status, 200);
    const metadata = await metadataResponse.json();
    assert.equal(metadata.click_count, 8);

    const injectionResponse = await client.request("/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_url: "https://example.org",
        code: "foo' OR 1=1 --",
      }),
    });
    assert.equal(injectionResponse.status, 400);
  } finally {
    await new Promise((resolve, reject) =>
      client.server.close((error) => (error ? reject(error) : resolve())),
    );
  }
});
