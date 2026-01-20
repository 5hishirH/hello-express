import { FileBody } from "../../types";

export interface FileStore {
  put(key: string, body: FileBody, contentType?: string): Promise<void>;
  get(key: string): Promise<Buffer>;
}
