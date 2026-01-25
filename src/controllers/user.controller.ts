import { Request, Response } from "express";
import {
  AppError,
  asyncHandler,
  HttpResponse,
  IRequest,
} from "../utils/index.js";
import { UserDto } from "../dtos/index.js";
import { Readable } from "stream";

interface UserService {
  profile(uid: number): Promise<UserDto>;
}

interface FileStore {
  getStream(key: string): Promise<{ stream: Readable; contentType: string }>;
}

export class UserController {
  constructor(
    private s: UserService,
    private storage: FileStore,
    private profilePicEndpointSuffix: string,
  ) {}

  profile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.s.profile(req.session.userId!);

    user.profilePic = `${req.protocol}://${req.get("host")}/${this.profilePicEndpointSuffix}`;

    return HttpResponse.ok(res, user, "Profile data is retrieved successfully");
  });

  streamProfilePic = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.s.profile(req.session.userId!);

    if (!user) {
      throw new Error("Could not fetch user data from db");
    }

    if (!user.profilePic) {
      throw AppError.notFound();
    }

    const result = await this.storage.getStream(user.profilePic);

    res.setHeader("Content-Type", result.contentType);

    result.stream.pipe(res);

    result.stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.end();
    });
  });
}
