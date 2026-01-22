import { createHash, timingSafeEqual, randomBytes } from "crypto";

export function generateRandomString(): string {
  const token = randomBytes(32).toString("hex");
  return token;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function verifyToken(
  candidateToken: string,
  storedHash: string,
): boolean {
  const candidateHash = hashToken(candidateToken);

  const candidateBuffer = Buffer.from(candidateHash, "utf8");
  const storedBuffer = Buffer.from(storedHash, "utf8");

  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }

  // Constant-time comparison
  return timingSafeEqual(candidateBuffer, storedBuffer);
}
