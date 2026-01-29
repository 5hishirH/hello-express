import { AuthResponse, UserDto } from "../dtos/index.js";
import { RegisterInput } from "../validators/index.js";
import { AppError, FileStore } from "../utils/index.js";
import { NewRefreshToken, NewUser, RefreshToken, User } from "../db/schema.js";
import bcrypt from "bcryptjs";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

interface UserRepository {
  create(newUser: NewUser): Promise<UserDto | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  userExists(email: string): Promise<Boolean>;
  findById(uid: number): Promise<UserDto | undefined>;
}

interface RefreshTokenRepository {
  create(payload: NewRefreshToken): Promise<void>;
  findByToken(tokenHash: string): Promise<RefreshToken | undefined>;
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

export class AuthService {
  private SALT_ROUNDS = 10;

  constructor(
    private userRepo: UserRepository,
    private refreshTokenRepo: RefreshTokenRepository,
    private fileStore: FileStore,
    private picNameGen: ProfilePicNameGenerator,
  ) {}

  private async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      throw new Error("Password Hasing failed");
    }
  }

  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      return isMatch;
    } catch (error) {
      throw new Error("Password verification failed");
    }
  }

  private randStrGen(): string {
    const token = randomBytes(32).toString("hex");
    return token;
  }

  private hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private verifyToken(candidateToken: string, storedHash: string): boolean {
    const candidateHash = this.hashToken(candidateToken);

    const candidateBuffer = Buffer.from(candidateHash, "utf8");
    const storedBuffer = Buffer.from(storedHash, "utf8");

    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }

    // Constant-time comparison
    return timingSafeEqual(candidateBuffer, storedBuffer);
  }

  private async saveRefreshToken(
    uid: number,
    duration: number,
    timestamp: Date = new Date(),
  ): Promise<string> {
    const refreshToken = this.randStrGen();
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTokenExpiry = new Date(Date.now() + duration);

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
    file: File,
    refreshTokenDuration: number,
  ): Promise<AuthResponse> {
    const emailExists = await this.userRepo.userExists(u.email);

    if (emailExists) {
      throw AppError.conflict(
        "The email is already associated with an account",
      );
    }

    const fileName = this.picNameGen({ fileName: u.email, ext: file.meta.ext });

    await this.fileStore.put(fileName, file.buffer, file.meta.mime);

    const passwordHash = await this.hashPassword(u.password);
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

    const user = await this.userRepo.create(candidateUser);

    if (!user) {
      throw new Error("User registration failed");
    }

    const refreshToken = await this.saveRefreshToken(
      user.id,
      refreshTokenDuration,
      timestamp,
    );

    return {
      refreshToken,
      user,
    };
  }

  async login(email: string, password: string, refreshTokenExpiry: number) {
    const userExists = await this.userRepo.findByEmail(email);

    if (!userExists) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const { passwordHash, ...user } = userExists;

    const isPassCorrect = await this.verifyPassword(password, passwordHash);

    if (!isPassCorrect) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const refreshToken = await this.saveRefreshToken(
      user.id,
      refreshTokenExpiry,
    );

    return {
      refreshToken,
      user,
    };
  }

  async refresh(
    refreshToken: string,
    refreshTokenDuration: number,
  ): Promise<{
    userId: number;
    userRole: UserDto["role"];
    newRefreshToken: string;
  }> {
    const tokenHash = this.hashToken(refreshToken);

    const tokenExists = await this.refreshTokenRepo.findByToken(tokenHash);

    if (!tokenExists) {
      throw AppError.unauthorized();
    }

    const uid: number = tokenExists.userId;

    const newRefreshToken: string = await this.saveRefreshToken(
      uid,
      refreshTokenDuration,
    );

    const user = await this.userRepo.findById(uid);

    if (!user) {
      throw new Error("Refresh token failed");
    }

    return { userId: user.id, userRole: user.role, newRefreshToken };
  }
}
