import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { FileBody } from "../types";

export class S3Store {
  private client: S3Client;
  private bucket: string;

  constructor(
    endpoint: string,
    accessKeyId: string,
    secretAccessKey: string,
    bucket: string,
    region: string,
  ) {
    this.bucket = bucket;

    this.client = new S3Client({
      forcePathStyle: true, // Required for Supabase S3
      region: region,
      endpoint: endpoint,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });
  }

  /**
   * Uploads a file to the bucket.
   * @param key - The file path/name in the bucket (e.g., "folder/image.png")
   * @param body - The file content
   * @param contentType - MIME type (optional)
   */
  async put(key: string, body: FileBody, contentType?: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.client.send(command);
  }

  async get(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error("File body is empty");
    }

    const byteArray = await response.Body.transformToByteArray();
    return Buffer.from(byteArray);
  }

  async getStream(
    key: string,
  ): Promise<{ stream: Readable; contentType: string }> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    // In Node.js, response.Body is an IncomingMessage (Readable Stream)
    return {
      stream: response.Body as Readable,
      contentType: response.ContentType || "application/octet-stream",
    };
  }

  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    console.log(`Delete successful: ${key}`);
  }
}
