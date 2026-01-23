import { AuthResponse } from "../dtos/index.js";
import { RegisterInput } from "../validators/index.js";
import {
  AppError,
  FileStore,
  generateRandomString,
  hashPassword,
  hashToken,
  verifyPassword,
} from "../utils/index.js";
import { NewToken, NewUser, User } from "../db/schema.js";

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

  private async saveRefreshToken(
    uid: number,
    e: number,
    timestamp: Date = new Date(),
  ): Promise<string> {
    const refreshToken = generateRandomString();
    const refreshTokenHash = hashToken(refreshToken);
    const refreshTokenExpiry = new Date(Date.now() + e);

    await this.refreshTokenRepo.create({
      tokenHash: refreshTokenHash,
      userId: uid,
      expiry: refreshTokenExpiry,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return refreshToken;
  }

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

    const refreshToken = await this.saveRefreshToken(
      createdUser.id,
      refreshTokenDuration,
      timestamp,
    );

    return {
      refreshToken,
      user: createdUser,
    };
  }

  async login(e: string, p: string, rte: number) {
    const userExists = await this.userRepo.findByEmail(e);

    if (!userExists) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const { passwordHash, ...user } = userExists;

    const isPassCorrect = await verifyPassword(p, passwordHash);

    if (!isPassCorrect) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const refreshToken = await this.saveRefreshToken(user.id, rte);

    return {
      refreshToken,
      user,
    };
  }
}
