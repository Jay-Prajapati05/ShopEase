import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // -----------------------------------------------------------------------
    // Saved Delivery Address
    // Persisted so the user does not have to re-type it on every checkout.
    // phone is mandatory; altPhone is optional backup for the delivery agent.
    // -----------------------------------------------------------------------
    savedAddress: {
      address:    { type: String, trim: true, maxlength: 200, default: "" },
      city:       { type: String, trim: true, maxlength: 100, default: "" },
      postalCode: { type: String, trim: true, maxlength: 20,  default: "" },
      country:    { type: String, trim: true, maxlength: 100, default: "India" },
      phone:      { type: String, trim: true, maxlength: 15,  default: "" }, // mandatory at checkout
      altPhone:   { type: String, trim: true, maxlength: 15,  default: "" }, // optional
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model("User", userSchema);