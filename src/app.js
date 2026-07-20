import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import PinoHttp from "pino-http";
import linksRoute from "./routes/links-route.js";
import docsRoute from "./routes/docs-route.js";
import { logger } from "./lib/logger.js";
import { config } from "./config.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({ origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN }),
  );
  app.use(express.json());
  app.use(PinoHttp({ logger }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      max: config.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use(docsRoute);
  app.use(linksRoute);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((err, _req, res, _next) => {
    const status = err.statusCode ?? 500;
    const message = status >= 500 ? "Internal Server Error" : (err.message ?? "Internal Server Error");
    const detail = status >= 500 ? undefined : (err.message ?? undefined)

    if (status > 500) {
      console.error("System Error Tracker:", err)
    }
    
    res.status(status).json({ error: message, ...(detail ? { detail } : {}) });
  });

  return app;
}

export default createApp();
