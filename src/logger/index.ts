import pino from "pino";

import { env } from "../config/env.js";

const level = env.NODE_ENV === "production" ? "info" : "debug";

export const logger =
  env.NODE_ENV === "development"
    ? pino({
        level,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      })
    : pino({
        level,
      });