import { Router } from "express";
import * as linkController from "../controllers/links-controller.js";
import * as clickController from "../controllers/click-controller.js";

const router = Router();

router.get("/", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Welcome to URL Shortener API. For more details visit /docs",
    })
});

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

router.get(["/links", "/links/"], (_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "Use POST /links to create a short link.",
  });
});

router.post("/links", linkController.createLink);
router.get("/:code", linkController.redirectToTarget);
router.get("/links/:code", linkController.getMetadata);
router.get("/links/:code/clicks", clickController.getClicks);
router.get("/links/:code/clicks.csv", clickController.exportCSV);
router.delete("/links/:code", linkController.deleteLink);

export default router;
