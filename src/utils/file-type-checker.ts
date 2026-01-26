import { fileTypeFromBuffer, FileTypeResult } from "file-type";
import { AppError } from "./index.js";

export class FileTypeChecker {
  constructor(private allowedTypes: string[] = ["jpg", "png", "webp"]) {}

  async check(b: Buffer): Promise<FileTypeResult> {
    const r = await fileTypeFromBuffer(b);

    if (!r || !this.allowedTypes.includes(r.ext)) {
      throw AppError.badRequest("Invalid file content. Expected an image");
    }

    return r;
  }
}
