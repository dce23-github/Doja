const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    code: { type: String, required: true },
    problemId: { type: Schema.Types.ObjectId, required: true },
    verdict: { type: String, required: true },
    timeTaken: { type: Number },
    memoryTaken: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Submission", submissionSchema);
