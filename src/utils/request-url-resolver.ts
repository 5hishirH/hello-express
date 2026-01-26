import { Request } from "express";

export class RequestUrlResolver {
  constructor(private path: string) {}

  resolve(r: Request) {
    const protocol = r.headers["x-forwarded-proto"] || r.protocol;
    return `${protocol}://${r.get("host")}${this.path}`;
  }
}
