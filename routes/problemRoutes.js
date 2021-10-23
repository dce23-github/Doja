const express = require("express");
const { problem__get } = require("../controllers/problemController");
const router = express.Router();

router.get("/:id", problem__get);

module.exports = router;
