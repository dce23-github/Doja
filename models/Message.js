const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Data = new Schema({
    filename: String,
    file: Buffer,
}, { timestamps: true });

const MessageSchema = new Schema({
    author: [{ type: ObjectId, ref: "User" }],
    data: Data,
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;