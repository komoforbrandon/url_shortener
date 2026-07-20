import createError from "http-errors";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { parse } from "../lib/validate.js";
import { codeParamSchema, clickLogQuerySchema } from "../lib/schemas.js";
import * as clickModel from "../models/clicks.js";
import * as linkModel from "../models/links.js";

export async function getClicks(req, res, next) {
  try {
    const code = parse(codeParamSchema, req.params.code);
    const query = parse(clickLogQuerySchema, req.query);
    const link = await linkModel.findByCode(code);

    if (!link) {
      throw createError(404, "Link not found");
    }

    const items = await clickModel.findPaginated({
      link_id: link.id,
      after: query.after,
      limit: query.limit,
    });

    res.json({
      items,
      next_cursor: items.length === query.limit ? items.at(-1)?.id : null,
    });
  } catch (error) {
    next(error);
  }
}

export async function exportCSV(req, res, next) {
  try {
    const code = parse(codeParamSchema, req.params.code);
    const link = await linkModel.findByCode(code);

    if (!link) {
      throw createError(404, "Link not found");
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${code}.csv"`);

    const dbStream = await clickModel.getStreamByLinkId(link.id);
    let isFirst = true;

    const csvTransformer = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        let chunk = "";

        if (isFirst) {
          chunk += "clicked_at,referrer,user_agent\n";
          isFirst = false;
        }

        const clickedAt = row.clicked_at
          ? new Date(row.clicked_at).toISOString()
          : "";
        const referrer = (row.referrer ?? "").replace(/"/g, '""');
        const userAgent = (row.user_agent ?? "").replace(/"/g, '""');

        chunk += `"${clickedAt}","${referrer}","${userAgent}"\n`;

        callback(null, chunk);
      },
    });

    await pipeline(dbStream, csvTransformer, res);
  } catch (error) {
    if (res.headersSent) {
      console.error("Stream disrupted midway:", error);
      return res.end();
    }
    next(error);
  }
}
