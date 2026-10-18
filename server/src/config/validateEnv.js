/**
 * Fail-fast environment variable validator.
 * Ensures the application does not start with missing essential secrets.
 */
export const validateEnv = () => {
  const requiredCoreVars = [
    "MONGODB_URI",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "CLIENT_URL",
  ];

  const missingCore = requiredCoreVars.filter((v) => !process.env[v]);

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
    ];

    const missingProd = requiredProdVars.filter((v) => !process.env[v]);
    if (missingProd.length > 0) {
      console.warn(
        `[WARNING] Production mode is active but optional third-party variables are missing: ${missingProd.join(", ")}`
      );
    }
  }
};
