import { randomBytes } from "crypto";

export function generateRandomString(): string {
  const token = randomBytes(32).toString("hex");
  return token;
}
