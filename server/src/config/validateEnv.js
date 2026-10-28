/**
 * Fail-fast environment variable validator.
 * Ensures the application does not start with missing essential secrets.
 */
export const validateEnv = () => {
  const missingCore = [];

  if (!process.env.MONGODB_URI) missingCore.push("MONGODB_URI");
  if (!process.env.CLIENT_URL) missingCore.push("CLIENT_URL");

  const hasAccessSecret = !!(
    process.env.JWT_ACCESS_SECRET || process.env.ACCESS_TOKEN_SECRET
  );
  if (!hasAccessSecret) missingCore.push("JWT_ACCESS_SECRET");

  const hasRefreshSecret = !!(
    process.env.JWT_REFRESH_SECRET || process.env.REFRESH_TOKEN_SECRET
  );
  if (!hasRefreshSecret) missingCore.push("JWT_REFRESH_SECRET");

  if (missingCore.length > 0) {
    const errorMsg = `[FATAL] Missing required environment variables: ${missingCore.join(", ")}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // In production, ensure third-party service credentials are also provided
  if (process.env.NODE_ENV === "production") {
    const requiredProdVars = [
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "RAZORPAY_KEY_ID",
      "RAZORPAY_KEY_SECRET",
      "GEMINI_API_KEY",
    ];

    const missingProd = requiredProdVars.filter((v) => !process.env[v]);
    if (missingProd.length > 0) {
      console.warn(
        `[WARNING] Production mode is active but optional third-party variables are missing: ${missingProd.join(", ")}`
      );
    }
  }
};
