const express = require("express");
const {
  signup_post,
  login_post,
  login_get,
  signup_get,
  logout_get,
} = require("../controllers/authController");
const router = express.Router();

router.get("/login", login_get);
router.post("/login", login_post);
router.get("/signup", signup_get);
router.post("/signup", signup_post);
router.get("/logout", logout_get);

module.exports = router;
