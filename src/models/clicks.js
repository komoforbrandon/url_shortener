import { db } from "../db.js";

export async function create({ link_id, referrer, user_agent }) {
  const { rows } = await db.query(
    `INSERT INTO clicks (link_id, referrer, user_agent)
     VALUES ($1, $2, $3)
     RETURNING id, link_id, clicked_at, referrer, user_agent;`,
    [link_id, referrer ?? null, user_agent ?? null],
  );

  return rows[0];
}

export async function findPaginated({ link_id, after, limit = 20 }) {
  const values = [link_id];
  let query = `SELECT id, clicked_at, referrer, user_agent
               FROM clicks
               WHERE link_id = $1`;

  if (after) {
    values.push(after);
    query += ` AND id < $2`;
  }

  values.push(limit);
  query += ` ORDER BY id DESC LIMIT $${values.length};`;

  const { rows } = await db.query(query, values);
  return rows;
}

export async function findAllByLinkId(link_id) {
  const { rows } = await db.query(
    `SELECT clicked_at, referrer, user_agent
     FROM clicks
     WHERE link_id = $1
     ORDER BY id DESC;`,
    [link_id],
  );

  return rows;
}

export async function deleteByLinkId(link_id) {
  await db.query(
    `DELETE FROM clicks
     WHERE link_id = $1;`,
    [link_id],
  );
}
