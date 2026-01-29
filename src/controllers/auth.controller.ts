import { Request, Response } from "express";
import {
  AppError,
  asyncHandler,
  HttpResponse,
  IRequest,
} from "../utils/index.js";
import {
  LoginInput,
  refreshTokenSchema,
  RegisterInput,
} from "../validators/index.js";
import { AuthResponse, UserDto } from "../dtos/index.js";
import { CookieOptions } from "express";
import { ZodError } from "zod";

interface ServiceFile {
  buffer: Buffer;
  meta: {
    ext: string;
    mime: string;
  };
}

interface AuthService {
  register(
    user: RegisterInput,
    file: ServiceFile,
    expiry: number,
  ): Promise<AuthResponse>;

  login(email: string, password: string, expiry: number): Promise<AuthResponse>;

  refresh(
    refreshToken: string,
    refreshTokenDuration: number,
  ): Promise<{
    userId: number;
    userRole: UserDto["role"];
    newRefreshToken: string;
  }>;
}

interface ImageChecker {
  check(buffer: Buffer): Promise<{ ext: string; mime: string }>;
}

interface RefreshCookieConfig {
  name: string;
  expiry: number;
  isSecure: boolean;
  sameSite: CookieOptions["sameSite"];
}

export class AuthController {
  constructor(
    private imageChecker: ImageChecker,
    private s: AuthService,
    private rCfg: RefreshCookieConfig,
    private sessionCookieName: string = "connect.sid",
  ) {}

  private createSession(req: Request, userId: number, role: "admin" | "user") {
    req.session.userId = userId;
    req.session.userRole = role;
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(this.rCfg.name, token, {
      maxAge: this.rCfg.expiry,
      httpOnly: true,
      secure: this.rCfg.isSecure,
      sameSite: this.rCfg.sameSite,
    });
  }

  private clearAuthCookie(r: Response): void {
    r.clearCookie(this.sessionCookieName);

    r.clearCookie(this.rCfg.name);
  }

  register = asyncHandler(
    async (req: IRequest<{}, RegisterInput>, res: Response) => {
      // file validation
      if (!req.file) {
        throw AppError.badRequest("Profile picture is required");
      }

      const { buffer } = req.file;

      const meta = await this.imageChecker.check(buffer);

      const file = { buffer, meta };

      const { user, refreshToken } = await this.s.register(
        req.body,
        file,
        this.rCfg.expiry,
      );

      // handle session
      this.createSession(req, user.id, user.role);

      // handle refresh token
      this.setRefreshCookie(res, refreshToken);

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
    this.setRefreshCookie(res, refreshToken);

    return HttpResponse.ok(res, user, "The user is logged in successfully");
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies[this.rCfg.name];

      const parsedStr = refreshTokenSchema.parse(refreshToken);

      const { userId, userRole, newRefreshToken } = await this.s.refresh(
        parsedStr,
        this.rCfg.expiry,
      );

      this.createSession(req, userId, userRole);

      this.setRefreshCookie(res, newRefreshToken);

      return HttpResponse.ok(res, {}, "Token refreshed successfully");
    } catch (error) {
      if (error instanceof ZodError) {
        throw AppError.unauthorized();
      }

      throw error;
    }
  });

  logout = asyncHandler(async (req: IRequest, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        throw new Error("Could not logout");
      }
    });

    this.clearAuthCookie(res);

    return HttpResponse.noContent(res);
  });
}
