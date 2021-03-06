const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const { isEmail } = require("validator");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    country: { type: String },
    userHandle: {
      type: String,
      required: true,
      unique: [true, "handle already exists"],
    },
    email: {
      type: String,
      // required: true,
      unique: [true, "email already registered"],
      // validate: [isEmail, "Please enter a valid email"],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "min length of password is 6 characters"],
    },

    googleId: {
      type: String,
    },
    organisation: {
      type: String,
    },
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    chat: [{ type: Schema.Types.ObjectId, ref: "Chat" }],

    teamInvites : [{ type: Schema.Types.ObjectId, ref: "Team" }],
    teams : [{ type: Schema.Types.ObjectId, ref: "Team" }],
    friendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    curTeam : {type : Schema.Types.ObjectId, ref : "Team"},
    
  },
  { timestamps: true }
);


userSchema.statics.login = async function (userCred, password, type) {
  if (type === "userHandle"){
    const user = await User.findOne({ userHandle: userCred });
    
    if (user) {
      console.log(user.password);
      console.log(password);
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      else
        throw Error("incorrect password");
    } else {
      throw Error("User does not exist");
    }
  } else {
    const user = await User.findOne({ email: userCred });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      else
        throw Error("incorrect password");
    } else {
      throw Error("incorrect email");
    }
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
