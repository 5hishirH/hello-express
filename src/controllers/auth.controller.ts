import { Response } from "express";
import { LoginInput } from "../dtos";
import { asyncHandler, HttpResponse, IRequest } from "../utils";

export class AuthController {
  login = asyncHandler(async (req: IRequest<{}, LoginInput>, res: Response) => {
    const body = req.body;

    return HttpResponse.ok(res, body, "Login successful");
  });
}
