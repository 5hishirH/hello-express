import { User } from "../db/schema.js";
import { UserDto } from "../dtos/index.js";

interface UserRepo {
  findById(uid: number): Promise<User | undefined>;
}

export class UserService {
  constructor(private r: UserRepo) {}

  async profile(uid: number): Promise<UserDto> {
    const result = await this.r.findById(uid);

    if (!result) {
      throw new Error("Fetching user from db failed");
    }

    const { passwordHash: _, ...user } = result;

    return user;
  }
}
