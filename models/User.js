const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    country: { type: String },
    email: {
      type: String,
      required: true,
      unique: [true, "email already registered"],
    },
    password: {
      type: String,
      required: true,
      minLength: [6, "min length of password is 6 characters"],
    },
    userHandle: {
      type: String,
      required: true,
      unique: [true, "handle already exists"],
    },
    googleId: {
      type: String,
    },
    college: {
      type: String,
    },
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submission" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
