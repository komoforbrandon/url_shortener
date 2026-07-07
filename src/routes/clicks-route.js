import { Router } from "express";

import * as linkController from "../controllers/link.controller.js";
import * as clickController from "../controllers/click.controller.js";

const router = Router();

/**
 * Health Check
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

/**
 * Create a short link
 * POST /links
 */
router.post("/links", linkController.createLink);

/**
 * Redirect using short code
 * GET /:code
 */
router.get("/:code", linkController.redirectToTarget);

/**
 * Link metadata
 * GET /links/:code
 */
router.get("/links/:code", linkController.getMetadata);

/**
 * Paginated click log
 * GET /links/:code/clicks
 */
router.get("/links/:code/clicks", clickController.getClicks);

/**
 * CSV export
 * GET /links/:code/clicks.csv
 */
router.get("/links/:code/clicks.csv", clickController.exportCSV);

/**
 * Delete link
 * DELETE /links/:code
 */
router.delete("/links/:code", linkController.deleteLink);

export default router;