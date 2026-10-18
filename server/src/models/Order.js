import mongoose from "mongoose";

// ---------------------------------------------------------------------------
// Sub-schema: one line item (product snapshot at order time)
//
// We store name, price and image at the moment of purchase.
// This protects the order record if the product is later edited or deleted.
// The server always re-reads these from the DB *before* creating the order —
// the client never sends prices.
// ---------------------------------------------------------------------------
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" }, // first product image URL at order time
    price: { type: Number, required: true, min: 0 }, // server-computed snapshot
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      validate: { validator: Number.isInteger, message: "Quantity must be a whole number" },
    },
  },
  { _id: false }, // no separate _id per item; order._id is enough
);

// ---------------------------------------------------------------------------
// Sub-schema: shipping address
// ---------------------------------------------------------------------------
const shippingAddressSchema = new mongoose.Schema(
  {
    address:    { type: String, required: true, trim: true, maxlength: 200 },
    city:       { type: String, required: true, trim: true, maxlength: 100 },
    postalCode: { type: String, required: true, trim: true, maxlength: 20  },
    country:    { type: String, required: true, trim: true, maxlength: 100 },
  },
  { _id: false },
);

// ---------------------------------------------------------------------------
// Allowed status values and which transitions are valid.
//
// The service enforces this; the controller never does raw string comparisons.
// ---------------------------------------------------------------------------
export const ORDER_STATUSES = Object.freeze({
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
});

// Directed adjacency list: which statuses can a given status move *to*.
// Symmetry: Delivered and Cancelled are terminal — no further moves.
export const VALID_TRANSITIONS = Object.freeze({
  [ORDER_STATUSES.PROCESSING]: [ORDER_STATUSES.SHIPPED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.SHIPPED]:    [ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.DELIVERED]:  [], // terminal
  [ORDER_STATUSES.CANCELLED]:  [], // terminal
});

// ---------------------------------------------------------------------------
// Allowed payment methods (COD for Phase 6; Razorpay added in Phase 8)
// ---------------------------------------------------------------------------
export const PAYMENT_METHODS = Object.freeze({
  COD: "COD",
  RAZORPAY: "Razorpay",
});

// ---------------------------------------------------------------------------
// Main Order schema
// ---------------------------------------------------------------------------
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // "my orders" queries filter by user — must be indexed
    },

    orderItems: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "An order must have at least one item",
      },
    },

    shippingAddress: { type: shippingAddressSchema, required: true },

    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: Object.values(PAYMENT_METHODS),
        message: "{VALUE} is not a supported payment method",
      },
    },

    // -----------------------------------------------------------------------
    // All monetary fields are SERVER-COMPUTED.
    // The client is never allowed to send these values.
    // -----------------------------------------------------------------------
    itemsPrice:    { type: Number, required: true, min: 0 },
    shippingPrice: { type: Number, required: true, min: 0, default: 0 },
    taxPrice:      { type: Number, required: true, min: 0, default: 0 },
    totalPrice:    { type: Number, required: true, min: 0 },

    // Payment tracking (used by Phase 8 — Razorpay)
    isPaid:  { type: Boolean, default: false },
    paidAt:  { type: Date },
    paymentResult: {
      // Razorpay fields stored after successful payment verification
      razorpayOrderId:   { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
    },

    orderStatus: {
      type: String,
      required: true,
      enum: {
        values: Object.values(ORDER_STATUSES),
        message: "{VALUE} is not a valid order status",
      },
      default: ORDER_STATUSES.PROCESSING,
    },

    // Populated when admin marks as Delivered (for COD, this also sets isPaid)
    deliveredAt: { type: Date },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

// ---------------------------------------------------------------------------
// Compound index: user + createdAt DESC
// Satisfies the most common query: "give me this user's orders, newest first".
// With this index, MongoDB never needs a collection scan for that query.
// ---------------------------------------------------------------------------
orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
