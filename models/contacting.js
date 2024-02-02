const mongoose = require("mongoose");

const breakingSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "email required"] },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    subject: { type: String, required: [true, "email required"] },
  },
  { timestamps: true }
);

const Breaking = mongoose.model("Breaking", breakingSchema);

module.exports = Breaking;
