import { FileBody } from "../../types/index.js";

export interface FileStore {
  put(key: string, body: FileBody, contentType?: string): Promise<void>;
  get(key: string): Promise<Buffer>;
}
