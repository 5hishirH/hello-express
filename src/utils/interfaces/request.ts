import { Request } from "express";
import { ParsedQs } from "qs";

export interface IRequest<TParams = {}, TBody = {}, TQuery = {}> extends Request<TParams, {}, TBody, TQuery & ParsedQs> {
  files?: any;
}