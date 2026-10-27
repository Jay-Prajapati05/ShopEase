class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // expected error, not a bug
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors = []) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
  static tooManyRequests(message = "Too many requests", errors = []) {
    return new ApiError(429, message, errors);
  }
  static internal(message = "Internal server error", errors = []) {
    return new ApiError(500, message, errors);
  }
  static serviceUnavailable(message = "Service unavailable", errors = []) {
    return new ApiError(503, message, errors);
  }
}

export default ApiError;