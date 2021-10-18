const jwt = require("jsonwebtoken");
const User = require("../models/User");

const maxAge = 3 * 24 * 3600;

const createToken = (id) => {
  return jwt.sign({ id }, "jwtKey", { expiresIn: maxAge });
};

const signup_get = (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
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
      throw Error("handle taken");
    }

    const user = await User.create({
      name,
      email,
      password,
      country,
      age,
      gender,
      userHandle,
      organisation,
    });

    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user });
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
    const { email, userHandle, password } = req.body;

    let userCred = "";
    let type = "";

    if (email !== undefined) {
      userCred = email;
      type = "email";
    } else {
      userCred = userHandle;
      type = "handle";
    }

    const user = await User.login(userCred, password, type);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
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
