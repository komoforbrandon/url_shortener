import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "node:fs";

const router = Router();
const spec = JSON.parse(
  readFileSync(new URL("../../docs/openapi.json", import.meta.url), "utf8"),
);
const swaggerHandler = swaggerUi.setup(spec);

router.use("/docs", swaggerUi.serve);
router.get("/docs", swaggerHandler);
router.get("/docs/", swaggerHandler);

export default router;
