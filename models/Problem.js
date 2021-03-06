const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testCase = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
});

const problemSchema = new Schema(
  {
    sno: { type: Number, required: true },
    contestId: { type: Schema.Types.ObjectId , ref : "Contest"},
    statement: {
      type: String,
      required: true,
    },
    input: { type: String, required: true }, // format
    output: { type: String, required: true }, // format
    constraints: { type: String, required: true },
    title: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    testCases: [testCase],
    // testExpOutput : [{type : String}],
    // sampleExpOutput : [{type : String}],
    sampleCases: [testCase],
    difficulty: { type: Number },
    tags: [{ type: String }],
    countAc: { type: Number, default: 0 },
    timeLimit: { type: Number, required: true },
    memoryLimit: { type: Number, required: true },
    timeTaken: { type: Number, }, // for showing on submission of user about time  of submission, min(timeTaken, timeLimit)
    memoryTaken: { type: Number, },//for showing on submission of user about memory taken by user program , min(memoryTaken, memoryLimit)
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
