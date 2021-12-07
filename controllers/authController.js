const jwt = require("jsonwebtoken");
const User = require("../models/User");
const maxAge = 3 * 24 * 3600;
const bcrypt = require("bcrypt");

const createToken = (id) => {
  return jwt.sign({ id }, "jwtKey", { expiresIn: maxAge });
};


const signup_get = (req, res) => {
  try {
    let user = null;
    res.render("auth/signup", {user});
  } catch (error) {
    console.log(error, "insidesigup error");
  }
};

const login_get = (req, res) => {
  try {
    res.render("signup");
  } catch (error) {
    console.log(error);
  }
};

const signup_post = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      age,
      gender,
      country,
      userHandle,
      organisation,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existsHandle = await User.findOne({ userHandle });

    if (existsHandle && existsHandle.userHandle === userHandle) {
      throw Error("Handle already taken...");
    }

    var ok = 1;

    for (var i = 0; i < userHandle.length; ++i) {
      if (userHandle[i] === "@") {
        ok = 0;
        break;
      }
    }

    if (!ok) {
      throw Error("Handle should not contain special characters!");
    } else {
      const salt = await bcrypt.genSalt();
      const passwordHashed = await bcrypt.hash(password, salt);

      const user = new User({
        name,
        email,
        password : passwordHashed,
        country,
        age,
        gender,
        userHandle,
        organisation,
      });

      await user.save();
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      // res.status(201).json({ user });
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    if (error.message === "handle taken") {
      res.status(400).json({ message: "user handle already taken!" });
    }
    if (error.code === 11000) {
      res.status(400).json({ message: "Email already exists" });
    }
    res.status(400).json({ message: "Could not sign up" });
  }
};


const login_post = async (req, res) => {
  try {
    const { username: userHandle, password } = req.body;

    let type = "";
    let ok = 0;

    for (var i = 0; i < userHandle.length; ++i) {
      if (userHandle[i] === "@") {
        ok = 1;
        break;
      }
    }

    if (ok) {
      type = "email";
    } else {
      type = "userHandle";
    }
    const user = await User.login(userHandle, password, type);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    console.log(user);
    res.status(201).json({ user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "login failed" });
  }
};

const logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};

module.exports = {
  signup_get,
  login_get,
  signup_post,
  login_post,
  logout_get,
};
