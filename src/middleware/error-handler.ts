import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ZodError } from "zod";

import { logger } from "../logger/index.js";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      details: error.issues,
    });

    return;
  }

  if (error instanceof Error) {
    const knownErrors: Record<string, number> = {
      RESERVED_NAME: 400,
      INVALID_WALLET: 400,
      USER_ALREADY_HAS_NAME: 409,
      NAME_ALREADY_TAKEN: 409,
      WALLET_ALREADY_HAS_NAME: 409,
      NAME_NOT_FOUND: 404,
      NAME_UNCHANGED: 400,
    };

    const statusCode = knownErrors[error.message];

    if (statusCode) {
      res.status(statusCode).json({
        success: false,
        error: error.message,
      });

      return;
    }
  }

  logger.error(
    {
      error,
      method: req.method,
      path: req.path,
    },
    "Unhandled request error",
  );

  res.status(500).json({
    success: false,
    error: "INTERNAL_SERVER_ERROR",
  });
}