const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const testCase = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
});

const problemSchema = new Schema(
  {
    contestId: { type: Schema.Types.ObjectId },
    statement: {
      type: String,
      required: true,
    },
    input: { type: String, required: true },
    output: { type: String, required: true },
    constraints: { type: String, required: true },
    title: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, required: true },
    testCases: [testCase],
    sampleCases: [testCase],
    difficulty: { type: Number },
    tags: [{ type: String }],
    countAc: { type: Number },
    timeTaken: { type: Number, required: true },
    memoryTaken: { type: Number, required: true },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", problemSchema);

module.exports = Problem;
