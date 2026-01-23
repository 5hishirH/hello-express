import { Response } from "express";
import { asyncHandler, HttpResponse } from "../utils/index.js";
import { UserDto } from "../dtos/index.js";

interface UserService {
  profile(uid: number): Promise<UserDto>;
}

export class UserController {
  constructor(private s: UserService) {}

  profile = asyncHandler(async (req, res: Response) => {
    const user = await this.s.profile(req.session.userId!);

    return HttpResponse.ok(res, user, "Profile data is retrieved successfully");
  });
}
