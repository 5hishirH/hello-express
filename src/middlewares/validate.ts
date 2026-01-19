import { Request, Response, NextFunction } from "express";
import * as z from "zod";
import { AppError } from "../utils";

const validate =
  (schema: z.ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {

        const appError = AppError.badRequest("Validation failed", error.issues);

        return next(appError);
      }

      return next(error);
    }
  };

export default validate;
