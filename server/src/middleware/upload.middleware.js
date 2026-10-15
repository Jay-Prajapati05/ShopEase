import multer from "multer";
import ApiError from "../utils/ApiError.js";

// Whitelisted MIME types (Roadmap pitfall: never trust file extension)
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file format (${file.mimetype}). Only JPEG, PNG, and WebP images are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

/**
 * Middleware that intercepts single image uploads with the field name "image".
 * Catches Multer errors (e.g. file size limit) and forwards clean ApiError responses.
 */
export const uploadSingleImage = (req, res, next) => {
  const handler = upload.single("image");

  handler(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(
          ApiError.badRequest(
            `File size exceeds the 5MB limit. Please upload a smaller image.`
          )
        );
      }
      return next(ApiError.badRequest(err.message));
    }

    return next(err);
  });
};

export default uploadSingleImage;
