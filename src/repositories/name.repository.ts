import type {
  Collection,
  DeleteResult,
  UpdateResult,
  WithId,
} from "mongodb";

import { getDatabase } from "../database/mongodb.js";
import { logger } from "../logger/index.js";

import type { SepName } from "../types/name.types.js";

const COLLECTION_NAME = "names";

function getCollection(): Collection<SepName> {
  return getDatabase().collection<SepName>(COLLECTION_NAME);
}

export async function createNameIndexes(): Promise<void> {
  const collection = getCollection();

  await Promise.all([
    collection.createIndex(
      { normalizedName: 1 },
      {
        unique: true,
        name: "unique_normalized_name",
      },
    ),

    collection.createIndex(
      { walletAddress: 1 },
      {
        unique: true,
        name: "unique_wallet_address",
      },
    ),

    collection.createIndex(
      { userId: 1 },
      {
        unique: true,
        name: "unique_user_id",
      },
    ),
  ]);

  logger.info("Name indexes initialized");
}

export async function createName(name: SepName): Promise<WithId<SepName>> {
  const collection = getCollection();

  const result = await collection.insertOne(name);

  const createdName = await collection.findOne({
    _id: result.insertedId,
  });

  if (!createdName) {
    throw new Error("Failed to retrieve created name");
  }

  return createdName;
}

export async function findByUsername(
  normalizedName: string,
): Promise<WithId<SepName> | null> {
  return getCollection().findOne({
    normalizedName,
  });
}

export async function findByWallet(
  walletAddress: string,
): Promise<WithId<SepName> | null> {
  return getCollection().findOne({
    walletAddress,
  });
}

export async function findByUserId(
  userId: string,
): Promise<WithId<SepName> | null> {
  return getCollection().findOne({
    userId,
  });
}

export async function searchNames(
  query: string,
  limit = 10,
): Promise<WithId<SepName>[]> {
  return getCollection()
    .find({
      normalizedName: {
        $regex: `^${escapeRegex(query)}`,
      },
      status: "active",
    })
    .sort({
      normalizedName: 1,
    })
    .limit(limit)
    .toArray();
}

export async function updateNameByUserId(
  userId: string,
  updates: Partial<
    Pick<SepName, "username" | "fullName" | "normalizedName" | "updatedAt">
  >,
): Promise<UpdateResult> {
  return getCollection().updateOne(
    {
      userId,
    },
    {
      $set: updates,
    },
  );
}

export async function deleteNameByUserId(
  userId: string,
): Promise<DeleteResult> {
  return getCollection().deleteOne({
    userId,
  });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}