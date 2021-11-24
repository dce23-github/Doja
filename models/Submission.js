const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    status : {type : String},
    userId: { type: Schema.Types.ObjectId, required: true , ref : "User"},
    code: { type: String, required: true },
    lang : {type : String, required : true, },
    probId: { type: Schema.Types.ObjectId, required: true, ref : "Problem"},
    output : [{type : String}],
    verdict : [{type : String}],
    time: [{ type: Number }],
    memory: [{ type: Number }],
    // filepath : {type : String, required : true,},
    type : {type : String, enum : ["sample", "test"], required : true},
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
