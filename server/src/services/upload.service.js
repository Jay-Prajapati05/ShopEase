import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

/**
 * upload.service.js
 *
 * All business logic for asset uploads and Cloudinary management.
 * Rules: Never touches req / res (Rule 3).
 */

/**
 * Upload an image buffer to Cloudinary using upload_stream.
 *
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {string} [folder="shopease/products"] - Destination folder in Cloudinary
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadImage = (buffer, folder = "shopease/products") => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw ApiError.badRequest("Invalid or empty image buffer");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(
            ApiError.internal(`Cloudinary upload failed: ${error.message}`)
          );
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete a single image from Cloudinary by its public_id.
 *
 * @param {string} publicId
 * @returns {Promise<any>}
 */
export const deleteImage = async (publicId) => {
  if (!publicId || typeof publicId !== "string") return null;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    // Log error but do not crash product operations if Cloudinary cleanup has network blip
    console.error(`Failed to delete Cloudinary asset "${publicId}":`, error);
    return null;
  }
};

/**
 * Bulk delete multiple Cloudinary images.
 *
 * @param {Array<{ public_id: string } | string>} images
 */
export const deleteImages = async (images) => {
  if (!Array.isArray(images) || images.length === 0) return;

  const publicIds = images
    .map((img) => (typeof img === "string" ? img : img?.public_id))
    .filter(Boolean);

  await Promise.allSettled(publicIds.map((id) => deleteImage(id)));
};
