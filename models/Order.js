const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  garments: [
    {
      name: String,
      quantity: Number,
      price: Number,
      subtotal: Number,
    },
  ],
  totalBill: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["RECEIVED", "PROCESSING", "READY", "DELIVERED"],
    default: "RECEIVED",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  estimatedDeliveryDate: String,
  notes: [String],
});

module.exports = mongoose.model("Order", orderSchema);
