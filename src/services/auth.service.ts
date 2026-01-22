import { AuthResponse } from "../dtos/index.js";
import { RegisterInput } from "../validators/index.js";
import { AppError, FileStore } from "../utils/index.js";
import { NewToken, NewUser, User } from "../db/schema.js";
import { hashPassword } from "../utils/hash-password.js";
import { generateRandomString, hashToken } from "../utils/sha-256-hash.js";

interface UserRepository {
  create(newUser: NewUser): Promise<void>;
  findByEmail(email: string): Promise<User | undefined>;
}

interface RefreshTokenRepository {
  create(payload: NewToken): Promise<void>;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private refreshTokenRepo: RefreshTokenRepository,
    private fileStore: FileStore,
    private folderName: string = "profile-pictures",
  ) {}

  async register(
    u: RegisterInput,
    buffer: Buffer,
    fileMeta: {
      ext: string;
      mime: string;
    },
    refreshTokenDuration: number,
  ): Promise<AuthResponse> {
    const userExists = await this.userRepo.findByEmail(u.email);

    if (userExists) {
      throw AppError.conflict(
        "The email is already associated with an account",
      );
    }

    const fileName = `${this.folderName}/${u.email}.${fileMeta.ext}`;

    await this.fileStore.put(fileName, buffer, fileMeta.mime);

    const passwordHash = await hashPassword(u.password);
    const timestamp = new Date();

    const candidateUser: NewUser = {
      email: u.email,
      passwordHash,
      role: "user",
      fullName: u.fullName,
      profilePic: fileName,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.userRepo.create(candidateUser);

    const result = await this.userRepo.findByEmail(u.email);

    if (!result) {
      throw new Error("User entry to db failed");
    }

    const { passwordHash: _, ...createdUser } = result;

    const refreshToken = generateRandomString();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpiry = new Date(Date.now() + refreshTokenDuration);

    await this.refreshTokenRepo.create({
      tokenHash: refreshTokenHash,
      userId: createdUser.id,
      expiry: refreshTokenExpiry,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return {
      refreshToken,
      user: createdUser,
    };
  }
}
