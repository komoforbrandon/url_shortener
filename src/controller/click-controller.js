import createError from "http-errors";
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

    const rows = await clickModel.findAllByLinkId(link.id);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${code}.csv"`);

    const lines = ["clicked_at,referrer,user_agent"];
    for (const row of rows) {
      lines.push(
        `"${row.clicked_at ?? ""}","${row.referrer ?? ""}","${row.user_agent ?? ""}"`,
      );
    }

    res.send(lines.join("\n"));
  } catch (error) {
    next(error);
  }
}
