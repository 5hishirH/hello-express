import { fromBuffer, FileTypeResult } from "file-type";
import { AppError } from "./app-error";

export function checkFileType(
  allowedTypes: string[] = ["jpg", "png", "webp"],
): (b: Buffer<ArrayBufferLike>) => Promise<FileTypeResult> {
  return async function (b: Buffer): Promise<FileTypeResult> {
    const r = await fromBuffer(b);

    if (!r || !allowedTypes.includes(r.ext)) {
      throw AppError.badRequest("Invalid file content. Expected an image");
    }

    return r;
  };
}
