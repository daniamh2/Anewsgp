const mongoose = require("mongoose");

const breakingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: [true, "post must be belong to author"],
    },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Breaking = mongoose.model("Breaking", breakingSchema);

module.exports = Breaking;
