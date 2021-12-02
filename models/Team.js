const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
// const { isEmail } = require("validator");

const teamSchema = new Schema(
  {
    name: { type: String, required: true, unique: [true, "Duplicate Team Name"] },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    acCnt: { type: Number }, // number of members who have accepted team invite
    valid: { type: Boolean }, // if all team members have accepted invite.
    chatId: { type: Schema.Types.ObjectId, ref: "Chat" },
    activeContest: { type: Schema.Types.ObjectId, ref: "Contest" },
    problemsSolved: [{ sno: Number, subId: { type: Schema.Types.ObjectId, ref: "Submission" } }],
    submissions: [{type : Schema.Types.ObjectId, ref : "Submission"} ],
  },
  { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;
