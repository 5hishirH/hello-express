import ms from "ms";
import { AuthResponse, UserDto } from "../dtos";
import { RegisterInput } from "../validators";
import { FileStore } from "../utils";

export class AuthService {
  constructor(
    private fileStore: FileStore,
    private folderName: string = "profile-pictures",
  ) {}

  async register(
    user: RegisterInput,
    buffer: Buffer,
    fileMeta: {
      ext: string;
      mime: string;
    },
    refreshTokenExpiry: ms.StringValue,
  ): Promise<AuthResponse> {
    const fileName = `${this.folderName}/${user.email}.${fileMeta.ext}`;

    await this.fileStore.put(fileName, buffer, fileMeta.mime);

    const u: UserDto = {
      email: user.email,
    };

    return {
      refreshToken: "refresh-token",
      user: u,
    };
  }

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
