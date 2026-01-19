import ms from "ms";
import { AuthResponse, UserDto } from "../dtos";

export class AuthService {
  async login(
    email: string,
    password: string,
    refreshTokenExpiry: ms.StringValue,
  ): Promise<AuthResponse> {
    const user: UserDto = {
      email,
    };

    return {
      refreshToken: "refresh-token",
      user,
    };
  }
}
