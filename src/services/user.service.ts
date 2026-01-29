import { UpdateDto, UserDto } from "../dtos/index.js";
import { FileStore } from "../utils/index.js";
import { UpdateUserInput } from "../validators/index.js";

interface UserRepo {
  findById(uid: number): Promise<UserDto | undefined>;
  updateOne(uid: number, updateInput: UpdateDto): Promise<UserDto | undefined>;
}

interface File {
  buffer: Buffer;
  meta: {
    ext: string;
    mime: string;
  };
}

interface ProfilePicNameGenerator {
  (meta: { fileName?: string; ext: string }): string;
}

export class UserService {
  private usrRetrievalErr: string;
  constructor(
    private r: UserRepo,
    private fileStore: FileStore,
    private picNameGen: ProfilePicNameGenerator,
  ) {
    this.usrRetrievalErr = "User retrieval from database failed";
  }

  async getProfile(uid: number): Promise<UserDto> {
    const user = await this.r.findById(uid);

    if (!user) {
      throw new Error(this.usrRetrievalErr);
    }

    return user;
  }

  async updateProfile(
    uid: number,
    updateBody: UpdateUserInput,
  ): Promise<UserDto> {
    const user = await this.r.updateOne(uid, updateBody);

    if (!user) {
      throw new Error("User update failed");
    }

    return user;
  }

  async updateProfilePic(uid: number, file: File): Promise<UserDto> {
    const user = await this.r.findById(uid);

    if (!user) {
      throw new Error(this.usrRetrievalErr);
    }

    let fileName: string =
      user.profilePic ||
      this.picNameGen({ fileName: user.email, ext: file.meta.ext });

    await this.fileStore.put(fileName, file.buffer, file.meta.mime);

    const updatedUser = await this.r.updateOne(user.id, {
      profilePic: fileName,
    });

    if (!updatedUser) {
      throw new Error("Profile picture update failed");
    }

    return user;
  }
}
