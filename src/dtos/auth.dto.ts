import { User } from "../db/schema.js";

export interface UserDto extends Omit<User, "passwordHash"> {}

export interface AuthResponse {
  refreshToken: string;
  user: UserDto;
}
