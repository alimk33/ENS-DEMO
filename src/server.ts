import { app } from "./app.js";
import { env } from "./config/env.js";
import { createNameIndexes } from "./repositories/name.repository.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./database/mongodb.js";
import { logger } from "./logger/index.js";

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    await createNameIndexes();

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        "SEP Name Service started",
      );
    });

    async function shutdown(signal: string): Promise<void> {
      logger.info({ signal }, "Graceful shutdown started");

      server.close(async () => {
        await disconnectDatabase();

        logger.info("SEP Name Service stopped");

        process.exit(0);
      });
    }

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });
  } catch (error) {
    logger.fatal({ error }, "Failed to start SEP Name Service");

    process.exit(1);
  }
}

void startServer();