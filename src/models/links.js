import createError from "http-errors";
import { db } from "../db.js";

export async function create({ code, target_url, expires_at }) {
  const normalizedExpiresAt = expires_at
    ? new Date(expires_at).toISOString()
    : null;

  try {
    const { rows } = await db.query(
      `INSERT INTO links (code, target_url, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, code, target_url, created_at, expires_at, click_count;`,
      [code, target_url, normalizedExpiresAt],
    );
    return rows[0];
  } catch (error) {
    if (error?.code === "23505") {
      throw createError(409, "Link with this code already exists");
    }
    throw error;
  }
}

export async function findByCode(code) {
  const { rows } = await db.query(
    `SELECT id, code, target_url, created_at, expires_at, click_count
     FROM links
     WHERE code = $1;`,
    [code],
  );

  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await db.query(
    `SELECT id, code, target_url, created_at, expires_at, click_count
     FROM links
     WHERE id = $1;`,
    [id],
  );

  return rows[0] ?? null;
}

export async function deleteByCode(code) {
  const { rowCount } = await db.query(
    `DELETE FROM links
     WHERE code = $1;`,
    [code],
  );

  return rowCount > 0;
}

export async function recordClick({ linkId, referrer, userAgent }) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE links
       SET click_count = click_count + 1
       WHERE id = $1;`,
      [linkId],
    );

    const { rows } = await client.query(
      `INSERT INTO clicks (link_id, referrer, user_agent)
       VALUES ($1, $2, $3)
       RETURNING id, link_id, clicked_at, referrer, user_agent;`,
      [linkId, referrer ?? null, userAgent ?? null],
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
