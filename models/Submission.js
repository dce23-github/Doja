const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    processed : {type : Boolean, default : false},
    accepted : {type : String},
    status : {type : String},
    teamId :{ type: Schema.Types.ObjectId, ref : "Team"}, 
    userId: { type: Schema.Types.ObjectId, ref : "User"},
    code: { type: String, required: true },
    lang : {type : String, required : true, },
    probId: { type: Schema.Types.ObjectId, required: true, ref : "Problem"},
    probTitle : {type : String},
    contestId : { type: Schema.Types.ObjectId, ref : "Contest"}, 
    contestTitle : {type : String},
    output : [{type : String}],
    verdict : [{type : String}],
    time: [{ type: Number }],
    memory: [{ type: Number }],
    // filepath : {type : String, required : true,},
    type : {type : String, enum : ["sample", "test"], required : true},
    submittedBy : {type : String},
    sno : {type : Number, required : true},
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;
