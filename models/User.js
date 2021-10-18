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
    email: {
      type: String,
      required: true,
      unique: [true, "email already registered"],
      validate: [isEmail, "Please enter a valid email"],
      lowercase: true,
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

//before new user is created - hashing of password must be done
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (userCred, password, type) {
  if (type === "handle") {
    const user = await User.findOne({ userHandle: userCred });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error("incorrect password");
    } else {
      throw Error("incorrect email");
    }
  } else {
    const user = await User.findOne({ email: userCred });
    if (user) {
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      }
      throw Error("incorrect password");
    } else {
      throw Error("incorrect email");
    }
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
