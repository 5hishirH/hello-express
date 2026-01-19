import { Response } from "express";
import { StringValue } from "ms";
import { asyncHandler, HttpResponse, IRequest } from "../utils";
import { LoginInput } from "../validators";
import { AuthResponse } from "../dtos";

interface AuthService {
  login(
    email: string,
    password: string,
    expiry: StringValue,
  ): Promise<AuthResponse>;
}

export class AuthController {
  constructor(
    private refreshTokenExpiry: StringValue,
    private s: AuthService,
  ) {}

  login = asyncHandler(async (req: IRequest<{}, LoginInput>, res: Response) => {
    const { email, password } = req.body;

    const result = await this.s.login(email, password, this.refreshTokenExpiry);

    // handle session cookie

    // handle refresh cookie

    return HttpResponse.ok(res, result.user, "Login successful");
  });
}
