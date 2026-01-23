import { Request, NextFunction } from "express";
import { AppError, asyncHandler } from "../utils/index.js";

export const authenticate = asyncHandler(
  async (r: Request, _, n: NextFunction) => {
    if (!r.session.userId) {
      throw AppError.unauthorized();
    }

    return n();
  },
);
