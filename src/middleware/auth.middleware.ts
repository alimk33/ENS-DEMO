import type {
  NextFunction,
  Request,
  Response,
} from "express";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.authUser) {
    res.status(401).json({
      success: false,
      error: "UNAUTHORIZED",
    });

    return;
  }

  next();
}