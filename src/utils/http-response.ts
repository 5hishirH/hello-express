import { Response } from "express";
import { Readable } from "stream";

export class HttpResponse {
  static ok<T>(
    res: Response,
    data: T,
    message: string = "Operation successful",
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created",
  ) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static list<T>(res: Response, data: T[], message: string = "List retrieved") {
    return res.status(200).json({
      success: true,
      message,
      data,
      count: data.length,
    });
  }

  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
  ) {
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static stream(r: Response, s: Readable, ct: string) {
    r.setHeader("Content-Type", ct);

    s.pipe(r);

    s.on("error", (err) => {
      console.error("Stream error:", err);
      r.end();
    });
  }
}
