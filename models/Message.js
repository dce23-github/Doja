const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Data = new Schema({
    name: {type : String},
    img: {type : Buffer},
});

const MessageSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String },
    data: Data,
    time : String,
}, { timestamps: true });

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;