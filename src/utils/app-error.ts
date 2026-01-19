export class AppError extends Error {
  public statusCode: number;
  public success: boolean;
  public data: any;
  public errors: any[];
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack?: string,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.data = null;
    this.errors = errors;
    this.isOperational = true;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static factory methods for common errors
  static badRequest(message: string, errors: any[] = []) {
    return new AppError(400, message, errors);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new AppError(401, message);
  }

  static forbidden(message: string = "Forbidden") {
    return new AppError(403, message);
  }

  static notFound(message: string = "Not found") {
    return new AppError(404, message);
  }

  static conflict(message: string = "Conflict") {
    return new AppError(409, message);
  }

  // throw normal error for internal error
}
