import * as z from "zod";
import { AppError, asyncHandler } from "../utils/index.js";

const validate = (schema: z.ZodObject) =>
  asyncHandler(async (req, _, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = parsed.body;
      req.params = parsed.params;
      // (todo: fix) req.query = parsed.query;

      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const appError = AppError.badRequest("Validation failed", error.issues);

        return next(appError);
      }

      return next(error);
    }
  });

export { validate };
