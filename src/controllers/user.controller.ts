import { Response } from "express";
import { asyncHandler, HttpResponse } from "../utils/index.js";
import { UserDto } from "../dtos/index.js";

interface UserService {
  profile(uid: number): Promise<UserDto>;
}

export class UserController {
  constructor(
    private s: UserService,
    private profilePicEndpointSuffix: string,
  ) {}

  profile = asyncHandler(async (req, res: Response) => {
    const user = await this.s.profile(req.session.userId!);

    user.profilePic = `${req.protocol}://${req.get("host")}/${this.profilePicEndpointSuffix}`;

    return HttpResponse.ok(res, user, "Profile data is retrieved successfully");
  });
}
