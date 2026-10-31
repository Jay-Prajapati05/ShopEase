import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDb from "../config/db.js";
import Product from "../models/Product.js";
import { seedProducts } from "../data/seedProducts.js";

// Resilient env loading: process.cwd() or fallback to server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const runSeeder = async () => {
  // 1. Strict production safety guard
  if (
    process.env.NODE_ENV === "production" ||
    process.env.MONGODB_URI?.includes("prod") ||
    process.env.RENDER
  ) {
    console.error(
      "\n❌ REFUSED: Seeder cannot run against a production database! Process aborted.\n"
    );
    process.exit(1);
  }

  // 2. Validate URI presence
  if (!process.env.MONGODB_URI) {
    console.error(
      "\n❌ Error: MONGODB_URI is missing. Please ensure MONGODB_URI is configured in server/.env.\n"
    );
    process.exit(1);
  }

  try {
    console.log("Connecting to database...");
    await connectDb();

    // Check if user wants to destroy/clear products
    if (process.argv.includes("--destroy") || process.argv.includes("-d")) {
      console.log("Clearing products from database...");
      const result = await Product.deleteMany({});
      console.log(
        `\n🗑️ Database Cleared: ${result.deletedCount} products removed successfully.\n`
      );
      await mongoose.disconnect();
      console.log("Database connection closed.");
      process.exit(0);
    }

    console.log("Clearing existing products before seeding...");
    await Product.deleteMany({});

    console.log(`Inserting ${seedProducts.length} seed products...`);
    const createdProducts = await Product.insertMany(seedProducts);

    console.log(
      `\n✅ Database Seeded Successfully: ${createdProducts.length} products inserted.\n`
    );

    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error while seeding database:", error.message || error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // Ignore disconnect error
    }
    process.exit(1);
  }
};

runSeeder();
