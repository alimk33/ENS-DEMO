import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must contain at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    "Username can only contain lowercase letters, numbers, and hyphens",
  );

export const sepNetworkSchema = z.enum([
  "sep-mainnet",
  "sep-testnet",
]);

export const registerNameSchema = z.object({
  userId: z.string().trim().min(1, "User ID is required"),

  username: usernameSchema,

  walletAddress: z
    .string()
    .trim()
    .min(1, "Wallet address is required"),

  network: sepNetworkSchema,
});

export const changeNameSchema = z.object({
  username: usernameSchema,
});

export const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "support",
  "help",
  "security",
  "system",
  "official",
  "sep",
  "root",
]);

export function isReservedUsername(
  username: string,
): boolean {
  return RESERVED_USERNAMES.has(
    username.toLowerCase(),
  );
}