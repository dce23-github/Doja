const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Data = new Schema({
    filename : String, 
    file : Buffer,
}, {timestamps: true});

const ChatSchema = new Schema({
    member_count: { type: String },
    authorized_users: [{ type: Schema.Types.ObjectId, ref: "User" }],
    online: [String], // online users
    media: [Data],
    links: [String],
    messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
});

const Chat = mongoose.model("Chat", ChatSchema);
module.exports = Chat;