import { Response } from "express";
import { StringValue } from "ms";
import {
  AppError,
  asyncHandler,
  checkFileType,
  HttpResponse,
  IRequest,
} from "../utils";
import { LoginInput, RegisterInput } from "../validators";
import { AuthResponse } from "../dtos";

interface AuthService {
  register(
    user: RegisterInput,
    buffer: Buffer,
    fileMeta: {
      ext: string;
      mime: string;
    },
    expiry: StringValue,
  ): Promise<AuthResponse>;

  login(
    email: string,
    password: string,
    expiry: StringValue,
  ): Promise<AuthResponse>;
}

const checkImage = checkFileType(["jpg", "png", "webp"]);

export class AuthController {
  constructor(
    private refreshTokenExpiry: StringValue,
    private s: AuthService,
  ) {}

  register = asyncHandler(
    async (req: IRequest<{}, RegisterInput>, res: Response) => {
      if (!req.file) {
        throw AppError.badRequest("Profile picture is required");
      }

      const { buffer } = req.file;

      const { ext, mime } = await checkImage(buffer);

      const { user } = await this.s.register(
        req.body,
        buffer,
        { ext, mime },
        this.refreshTokenExpiry,
      );

      return HttpResponse.created(
        res,
        user,
        "The user is registered successfully",
      );
    },
  );

  login = asyncHandler(async (req: IRequest<{}, LoginInput>, res: Response) => {
    const { email, password } = req.body;

    const result = await this.s.login(email, password, this.refreshTokenExpiry);

    // handle session cookie

    // handle refresh cookie

    return HttpResponse.ok(res, result.user, "Login successful");
  });
}
