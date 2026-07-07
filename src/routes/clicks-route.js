import { Router } from "express";

import * as linkController from "../controllers/link.controller.js";
import * as clickController from "../controllers/click.controller.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});


router.post("/links", linkController.createLink);

router.get("/:code", linkController.redirectToTarget);


router.get("/links/:code", linkController.getMetadata);

router.get("/links/:code/clicks", clickController.getClicks);

router.get("/links/:code/clicks.csv", clickController.exportCSV);

router.delete("/links/:code", linkController.deleteLink);

export default router;