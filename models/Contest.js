const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    description: { type: String, required: true },
    prize: { type: String },
    registrations: [{ type: Schema.Types.ObjectId, ref: "User" }],
    problems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    organisation: { type: String, required: true },
    contestTitle: { type: String, required: true },
    isInitiated: { type: Boolean },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", contestSchema);

module.exports = Contest;
