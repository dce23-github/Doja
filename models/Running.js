const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const runningSchema = new Schema({
    name : {type : String},// just for finding
    contests : [{type : Schema.Types.ObjectId, ref : "Contest"}],
});

const Running = mongoose.model("Running", runningSchema);
module.exports = Running;

