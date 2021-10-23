const express = require("express");
const router = express.Router();
const {
  createContest__post,
  getContest__get,
  initiateContest__patch,
  deleteContest__delete,
  updateContest__patch,
  addProblem__post,
  addTestcase__patch,
} = require("../controllers/contestController");

router.post("/create", createContest__post);
router.get("/:id", getContest__get);
router.patch("/initiate/:id", initiateContest__patch);
router.patch("/update/:id", updateContest__patch);
router.delete("/delete/:id", deleteContest__delete);
router.post("/:id/addProblem", addProblem__post);
router.patch("/:id/:pid/addTestcase", addTestcase__patch);

module.exports = router;
