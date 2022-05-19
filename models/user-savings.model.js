const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    rank: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    cycle: { type: Number, default: 0 },
    collected: { type: Boolean, default: false },
    payments: [
      {
        paymentReference: { type: String },
        amount: { type: Number },
        status: { type: String, enum: ["pending", "successful"], default: "pending" },
        createdAt: { type: Date, default: Date.now() },
      },
    ],
  },
  { timestamps: true }
);

const UserData = mongoose.model("UserData", userDataSchema);

module.exports = UserData;
