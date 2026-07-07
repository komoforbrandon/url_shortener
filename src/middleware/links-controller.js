import createError from "http-errors";
import { parse } from "../lib/validate.js";
import { createLinkSchema, codeParamSchema } from "../lib/schemas.js";
import * as linkModel from "../models/links.js";
import * as clickModel from "../models/clicks.js";

export async function createLink(req, res, next) {
  try {
    const payload = parse(createLinkSchema, req.body);
    const code = payload.code ?? Math.random().toString(36).slice(2, 8);
    const link = await linkModel.create({
      code,
      target_url: payload.target_url,
      expires_at: payload.expires_at,
    });

    res.status(201).json(link);
  } catch (error) {
    next(error);
  }
}

export async function redirectToTarget(req, res, next) {
  try {
    const code = parse(codeParamSchema, req.params.code);
    const link = await linkModel.findByCode(code);

    if (!link) {
      throw createError(404, "Link not found");
    }

    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      res.status(410).json({ error: "Link expired" });
      return;
    }

    const click = await linkModel.recordClick({
      linkId: link.id,
      referrer: req.get("referer") ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    res.redirect(302, link.target_url);
  } catch (error) {
    if (error?.statusCode === 404 || error?.statusCode === 410) {
      next(error);
      return;
    }

    next(error);
  }
}

export async function getMetadata(req, res, next) {
  try {
    const code = parse(codeParamSchema, req.params.code);
    const link = await linkModel.findByCode(code);

    if (!link) {
      throw createError(404, "Link not found");
    }

    res.json(link);
  } catch (error) {
    next(error);
  }
}

export async function deleteLink(req, res, next) {
  try {
    const code = parse(codeParamSchema, req.params.code);
    const deleted = await linkModel.deleteByCode(code);

    if (!deleted) {
      throw createError(404, "Link not found");
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
