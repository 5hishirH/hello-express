import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";
import { AppError } from "../utils/index.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
});

export const uploadSingle = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadHandler = upload.single(fieldName);

    uploadHandler(req, res, (err) => {
      if (err) {
        if (err instanceof MulterError) {
          switch (err.code) {
            case "LIMIT_UNEXPECTED_FILE":
              return next(
                AppError.badRequest(
                  `Field "${fieldName}" is required or unexpected`,
                ),
              );
            default:
              return next(AppError.badRequest("File upload error"));
          }
        }
        return next(err);
      }

      next();
    });
  };
};
