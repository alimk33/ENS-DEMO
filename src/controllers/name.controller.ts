import type { Request, Response } from "express";

import {
  changeNameSchema,
  registerNameSchema,
  usernameSchema,
} from "../schemas/name.schema.js";

import {
  changeName,
  checkNameAvailability,
  getMyName,
  registerName,
  removeName,
  resolveName,
  reverseResolve,
  searchUsernames,
} from "../services/name.service.js";

function getRouteParam(
  value: string | string[] | undefined,
  errorCode: string,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(errorCode);
  }

  return value;
}

export async function registerNameController(
  req: Request,
  res: Response,
): Promise<void> {
  const input = registerNameSchema.parse(req.body);

  const name = await registerName(input);

  res.status(201).json({
    success: true,
    data: name,
  });
}

export async function checkNameAvailabilityController(
  req: Request,
  res: Response,
): Promise<void> {
  const usernameParam = getRouteParam(
    req.params.username,
    "INVALID_NAME",
  );

  const normalizedName = usernameSchema.parse(usernameParam);

  const available =
    await checkNameAvailability(normalizedName);

  res.status(200).json({
    success: true,
    data: {
      username: normalizedName,
      fullName: `${normalizedName}.sep`,
      available,
    },
  });
}

export async function resolveNameController(
  req: Request,
  res: Response,
): Promise<void> {
  const username = getRouteParam(
    req.params.username,
    "INVALID_NAME",
  );

  const name = await resolveName(username);

  if (!name) {
    throw new Error("NAME_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: name,
  });
}

export async function reverseResolveController(
  req: Request,
  res: Response,
): Promise<void> {
  const walletAddress = getRouteParam(
    req.params.walletAddress,
    "INVALID_WALLET",
  );

  const name = await reverseResolve(walletAddress);

  if (!name) {
    throw new Error("NAME_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: name,
  });
}

export async function searchNamesController(
  req: Request,
  res: Response,
): Promise<void> {
  const query =
    typeof req.query.q === "string"
      ? req.query.q
      : "";

  const names = await searchUsernames(query);

  res.status(200).json({
    success: true,
    data: names,
  });
}

export async function getMyNameController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = getRouteParam(
    req.params.userId,
    "INVALID_USER",
  );

  const name = await getMyName(userId);

  if (!name) {
    throw new Error("NAME_NOT_FOUND");
  }

  res.status(200).json({
    success: true,
    data: name,
  });
}

export async function changeNameController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = getRouteParam(
    req.params.userId,
    "INVALID_USER",
  );

  const input = changeNameSchema.parse(req.body);

  const name = await changeName(
    userId,
    input.username,
  );

  res.status(200).json({
    success: true,
    data: name,
  });
}

export async function removeNameController(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = getRouteParam(
    req.params.userId,
    "INVALID_USER",
  );

  const deleted = await removeName(userId);

  if (!deleted) {
    throw new Error("NAME_NOT_FOUND");
  }

  res.status(204).send();
}