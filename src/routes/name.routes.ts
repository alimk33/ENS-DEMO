import {
  Router,
  type Router as ExpressRouter,
} from "express";

import {
  changeNameController,
  checkNameAvailabilityController,
  getMyNameController,
  registerNameController,
  removeNameController,
  resolveNameController,
  reverseResolveController,
  searchNamesController,
} from "../controllers/name.controller.js";

export const nameRouter: ExpressRouter = Router();

nameRouter.post(
  "/",
  registerNameController,
);

nameRouter.get(
  "/search",
  searchNamesController,
);

nameRouter.get(
  "/availability/:username",
  checkNameAvailabilityController,
);

nameRouter.get(
  "/resolve/:username",
  resolveNameController,
);

nameRouter.get(
  "/reverse/:walletAddress",
  reverseResolveController,
);

nameRouter.get(
  "/user/:userId",
  getMyNameController,
);

nameRouter.patch(
  "/user/:userId",
  changeNameController,
);

nameRouter.delete(
  "/user/:userId",
  removeNameController,
);