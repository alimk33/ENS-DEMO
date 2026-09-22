import cors from "cors";
import express, { type Express } from "express";
import { nameRouter } from "./routes/name.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { logger } from "./logger/index.js";
import { healthRouter } from "./routes/health.routes.js";

export const app: Express = express();

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin: false,
  }),
);

app.use(express.json({ limit: "20kb" }));

app.use(
  pinoHttp({
    logger,
  }),
);

app.use("/health", healthRouter);

app.use("/api/v1/names", nameRouter);

app.use(errorHandler);