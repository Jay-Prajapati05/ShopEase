import ApiError from "../utils/ApiError.js";

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON body";
  }

  const isProd = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    console.error(err);
    if (isProd) message = "Internal server error"; // never leak internals
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(!isProd && statusCode >= 500 && { stack: err.stack }),
  });
};