import { Response, NextFunction, RequestHandler } from "express";
import { IRequest } from "./interfaces";

type AsyncRequestHandler<P = {}, B = {}, Q = {}> = (
  req: IRequest<P, B, Q>,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export const asyncHandler = <P, B, Q>(
  requestHandler: AsyncRequestHandler<P, B, Q>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req as any, res, next)).catch(next);
  };
};
