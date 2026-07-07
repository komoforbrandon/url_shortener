import { db } from "../db.js";

export async function create({
  link_id,
  referrer,
  user_agent,
}) {
  const { rows } = await db.query(
    `
    INSERT INTO clicks (
      link_id,
      referrer,
      user_agent
    )
    VALUES ($1, $2, $3)
    RETURNING
      id,
      link_id,
      clicked_at,
      referrer,
      user_agent;
    `,
    [link_id, referrer, user_agent]
  );

  return rows[0];
}

/**
 * Get paginated click log (keyset pagination)
 */
export async function findPaginated({
  link_id,
  after,
  limit = 20,
}) {
  const values = [link_id];
  let query = `
    SELECT
      id,
      clicked_at,
      referrer,
      user_agent
    FROM clicks
    WHERE link_id = $1
  `;

  if (after) {
    values.push(after);
    query += ` AND clicked_at < $2`;
  }

  values.push(limit);

  query += `
    ORDER BY clicked_at DESC
    LIMIT $${values.length};
  `;

  const { rows } = await db.query(query, values);

  return rows;
}

/**
 * Export all clicks for CSV generation
 */
export async function findAllByLinkId(link_id) {
  const { rows } = await db.query(
    `
    SELECT
      clicked_at,
      referrer,
      user_agent
    FROM clicks
    WHERE link_id = $1
    ORDER BY clicked_at DESC;
    `,
    [link_id]
  );

  return rows;
}

/**
 * Delete all clicks for a link
 * (Usually unnecessary because of ON DELETE CASCADE)
 */
export async function deleteByLinkId(link_id) {
  await db.query(
    `
    DELETE FROM clicks
    WHERE link_id = $1;
    `,
    [link_id]
  );
}