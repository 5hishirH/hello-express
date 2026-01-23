import { Request, Response } from "express";
import {
  AppError,
  asyncHandler,
  checkFileType,
  HttpResponse,
  IRequest,
} from "../utils/index.js";
import { LoginInput, RegisterInput } from "../validators/index.js";
import { AuthResponse } from "../dtos/index.js";
import { CookieOptions } from "express";

interface AuthService {
  register(
    user: RegisterInput,
    buffer: Buffer,
    fileMeta: {
      ext: string;
      mime: string;
    },
    expiry: number,
  ): Promise<AuthResponse>;

  login(email: string, password: string, expiry: number): Promise<AuthResponse>;
}

interface CheckImage {
  (buffer: Buffer): Promise<{ ext: string; mime: string }>;
}

interface RefreshCookieConfig {
  name: string;
  expiry: number;
  isSecure: boolean;
  sameSite: CookieOptions["sameSite"];
}

export class AuthController {
  constructor(
    private checkImage: CheckImage,
    private s: AuthService,
    private rCfg: RefreshCookieConfig,
  ) {}

  private createSession(req: Request, userId: number, role: "admin" | "user") {
    req.session.userId = userId;
    req.session.userRole = role;
  }

  private handleRefreshCookie(res: Response, token: string): void {
    res.cookie(this.rCfg.name, token, {
      maxAge: this.rCfg.expiry,
      httpOnly: true,
      secure: this.rCfg.isSecure,
      sameSite: this.rCfg.sameSite,
    });
  }

  register = asyncHandler(
    async (req: IRequest<{}, RegisterInput>, res: Response) => {
      // file validation
      if (!req.file) {
        throw AppError.badRequest("Profile picture is required");
      }

      const { buffer } = req.file;

      const { ext, mime } = await this.checkImage(buffer);

      const { user, refreshToken } = await this.s.register(
        req.body,
        buffer,
        { ext, mime },
        this.rCfg.expiry,
      );

      // handle session
      this.createSession(req, user.id, user.role);

      // handle refresh token
      this.handleRefreshCookie(res, refreshToken);

      return HttpResponse.created(
        res,
        user,
        "The user is registered successfully",
      );
    },
  );

  login = asyncHandler(async (req: IRequest<{}, LoginInput>, res: Response) => {
    const { email, password } = req.body;

    const { user, refreshToken } = await this.s.login(
      email,
      password,
      this.rCfg.expiry,
    );

    // handle session
    this.createSession(req, user.id, user.role);

    // handle refresh token
    this.handleRefreshCookie(res, refreshToken);

    return HttpResponse.ok(res, user, "The user is logged in successfully");
  });
}
