import { db } from "../db.js";
import createError from 'http-errors'
export async function create({ code, target_url, expires_at }) {
  try {
    const { rows } = await db.query(
      `INSERT INTO links(code, target_url, expires_at)
            VALUES($1,$2,$3)
            RETURNING id, code, target_url, created_at, expires_at, click_count`,
      [code, target_url, expires_at],
    );
    return rows[0];
  } catch (err) {
    if (err.code === "23505") {
      throw createError(409, "Link with this code already exists");
    }
    throw err;
  }
}

export async function findByCode(code) {
  const { rows } = await db.query(
    `SELECT id, code, target_url, created_at, expires_at,click_count FROM links WHERE code=$1`,
    [code],
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await db.query(
    `
    SELECT
      id,
      code,
      target_url,
      created_at,
      expires_at,
      click_count
    FROM links
    WHERE id = $1
    `,
    [id]
  );

  return rows[0] ?? null;
}

export async function deleteByCode(code) {
  const { rowCount } = await db.query(
    `
    DELETE FROM links
    WHERE code = $1;
    `,
    [code]
  );

  return rowCount > 0;
}

/**
 * Atomically increment the click counter.
 * Pass a transaction client when inside a transaction.
 */
export async function incrementClickCount(client, id) {
  await client.query(
    `
    UPDATE links
    SET click_count = click_count + 1
    WHERE id = $1;
    `,
    [id]
  );
}