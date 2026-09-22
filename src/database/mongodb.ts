import { MongoClient } from "mongodb";

import { env } from "../config/env.js";
import { logger } from "../logger/index.js";

const client = new MongoClient(env.MONGODB_URI);

export async function connectDatabase(): Promise<void> {
  await client.connect();

  await client.db(env.MONGODB_DB_NAME).command({
    ping: 1,
  });

  logger.info("MongoDB connected");
}

export function getDatabase() {
  return client.db(env.MONGODB_DB_NAME);
}

export async function disconnectDatabase(): Promise<void> {
  await client.close();

  logger.info("MongoDB disconnected");
}