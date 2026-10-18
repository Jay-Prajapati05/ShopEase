import "dotenv/config"; // must be the first import so app.js can read the env values
import { validateEnv } from "./config/validateEnv.js";
import { app } from "./app.js";
import connectDB from "./config/db.js";

// Fail-fast environment variable check before boot
validateEnv();

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
  });