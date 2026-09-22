import { getAddress, isAddress } from "ethers";

import {
  createName,
  deleteNameByUserId,
  findByUserId,
  findByUsername,
  findByWallet,
  searchNames,
  updateNameByUserId,
} from "../repositories/name.repository.js";

import {
  isReservedUsername,
  usernameSchema,
} from "../schemas/name.schema.js";

import type { SepName, SepNetwork } from "../types/name.types.js";

export interface RegisterNameInput {
  userId: string;
  username: string;
  walletAddress: string;
  network: SepNetwork;
}

export async function registerName(
  input: RegisterNameInput,
): Promise<SepName> {
  const normalizedName = usernameSchema.parse(input.username);

  if (isReservedUsername(normalizedName)) {
    throw new Error("RESERVED_NAME");
  }

  if (!isAddress(input.walletAddress)) {
    throw new Error("INVALID_WALLET");
  }

  const walletAddress = getAddress(input.walletAddress);

  const existingUserName = await findByUserId(input.userId);

  if (existingUserName) {
    throw new Error("USER_ALREADY_HAS_NAME");
  }

  const existingName = await findByUsername(normalizedName);

  if (existingName) {
    throw new Error("NAME_ALREADY_TAKEN");
  }

  const existingWallet = await findByWallet(walletAddress);

  if (existingWallet) {
    throw new Error("WALLET_ALREADY_HAS_NAME");
  }

  const now = new Date();

  const name: SepName = {
    userId: input.userId,
    username: normalizedName,
    normalizedName,
    fullName: `${normalizedName}.sep`,
    walletAddress,
    network: input.network,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  return createName(name);
}

export async function resolveName(username: string) {
  const normalizedName = usernameSchema.parse(username);

  return findByUsername(normalizedName);
}

export async function reverseResolve(walletAddress: string) {
  if (!isAddress(walletAddress)) {
    throw new Error("INVALID_WALLET");
  }

  const normalizedWalletAddress = getAddress(walletAddress);

  return findByWallet(normalizedWalletAddress);
}

export async function getMyName(userId: string) {
  return findByUserId(userId);
}

export async function searchUsernames(query: string) {
  const normalizedQuery = query
    .trim()
    .replace(/^@/, "")
    .toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return searchNames(normalizedQuery);
}

export async function checkNameAvailability(
  username: string,
): Promise<boolean> {
  const normalizedName = usernameSchema.parse(username);

  if (isReservedUsername(normalizedName)) {
    return false;
  }

  const existingName = await findByUsername(normalizedName);

  return existingName === null;
}

export async function changeName(
  userId: string,
  newUsername: string,
) {
  const normalizedName = usernameSchema.parse(newUsername);

  if (isReservedUsername(normalizedName)) {
    throw new Error("RESERVED_NAME");
  }

  const currentName = await findByUserId(userId);

  if (!currentName) {
    throw new Error("NAME_NOT_FOUND");
  }

  if (currentName.normalizedName === normalizedName) {
    throw new Error("NAME_UNCHANGED");
  }

  const existingName = await findByUsername(normalizedName);

  if (existingName) {
    throw new Error("NAME_ALREADY_TAKEN");
  }

  await updateNameByUserId(userId, {
    username: normalizedName,
    normalizedName,
    fullName: `${normalizedName}.sep`,
    updatedAt: new Date(),
  });

  return findByUserId(userId);
}

export async function removeName(
  userId: string,
): Promise<boolean> {
  const result = await deleteNameByUserId(userId);

  return result.deletedCount === 1;
}