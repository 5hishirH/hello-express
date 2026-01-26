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

interface RequestUrlResolver {
  resolve(r: Request): string;
}

export class UserController {
  constructor(
    private s: UserService,
    private storage: FileStore,
    private requestUrlResolver: RequestUrlResolver,
  ) {}

  profile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.s.profile(req.session.userId!);

    user.profilePic = this.requestUrlResolver.resolve(req);

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

    return HttpResponse.stream(res, result.stream, result.contentType);
  });
}
