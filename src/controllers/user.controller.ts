import { Request, Response } from "express";
import {
  AppError,
  asyncHandler,
  HttpResponse,
  IRequest,
} from "../utils/index.js";
import { UserDto } from "../dtos/index.js";
import { Readable } from "stream";
import { UpdateUserInput } from "../validators/index.js";

interface CheckedImageResult {
  ext: string;
  mime: string;
}

interface ServiceFile {
  buffer: Buffer;
  meta: CheckedImageResult;
}

interface UserService {
  getProfile(uid: number): Promise<UserDto>;
  updateProfile(uid: number, updateInput: UpdateUserInput): Promise<UserDto>;
  updateProfilePic(uid: number, file: ServiceFile): Promise<UserDto>;
}

interface FileStore {
  getStream(key: string): Promise<{ stream: Readable; contentType: string }>;
}

interface ImageChecker {
  check(buffer: Buffer): Promise<CheckedImageResult>;
}

interface RequestUrlResolver {
  resolve(r: Request): string;
}

export class UserController {
  private sessionRetrievalErr: string;

  constructor(
    private s: UserService,
    private storage: FileStore,
    private imageChecker: ImageChecker,
    private requestUrlResolver: RequestUrlResolver,
  ) {
    this.sessionRetrievalErr = "Session retrieval failed";
  }

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.s.getProfile(req.session.userId!);

    user.profilePic = this.requestUrlResolver.resolve(req);

    return HttpResponse.ok(res, user, "Profile data is retrieved successfully");
  });

  updateProfile = asyncHandler(
    async (req: IRequest<{}, UpdateUserInput>, res: Response) => {
      if (!req.session.userId) {
        throw new Error(this.sessionRetrievalErr);
      }

      const user = await this.s.updateProfile(req.session.userId, req.body);

      user.profilePic = this.requestUrlResolver.resolve(req);

      return HttpResponse.ok(
        res,
        user,
        "The user profile is updated successfully",
      );
    },
  );

  udpateProfilePic = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.session.userId;
    if (!uid) {
      throw new Error(this.sessionRetrievalErr);
    }

    const buffer = req.file?.buffer;
    if (!buffer) {
      throw AppError.badRequest("Profile picture is required");
    }

    const result = await this.imageChecker.check(buffer);

    const file: ServiceFile = {
      buffer,
      meta: result,
    };

    const user = await this.s.updateProfilePic(uid, file);

    return HttpResponse.ok(
      res,
      user,
      "The profile picture is updated successfully",
    );
  });

  streamProfilePic = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.s.getProfile(req.session.userId!);

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
