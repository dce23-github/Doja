const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contestSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    description: { type: String, required: true },
    prize: { type: String, required: true },
    registrations: [{ type: Schema.Types.ObjectId }],
    problems: [{ type: Schema.Types.ObjectId, ref: "Problem" }],
    organisationName: { type: String },
    constestTitle: { type: String, required: true },
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", contestSchema);

module.exports = Contest;
