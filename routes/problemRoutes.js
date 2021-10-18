const express = require("express");
const router = express.Router();

router.get("/:id", problem__get);

module.exports = router;
