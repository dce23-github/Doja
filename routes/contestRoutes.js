const express = require("express");
const router = express.Router();
const {
  createContest__post,
  createContest_get,
  getContest__get,
  initiateContest__patch,
  deleteContest__delete,
  updateContest__patch,
  addProblem__post,
  addTestcase__patch,
  addProblem__get,
  allContest__get,
  addProblem__patch,
  addProblemEdit__get,
  getProblem__get,
  getUpdateContest__get,
  runningContest__get,
  getStandings__get,
} = require("../controllers/contestController");

router.get("/all", allContest__get);
router.get("/running", runningContest__get);
router.get("/create", createContest_get);
router.post("/create", createContest__post);
router.post("/:id/update", updateContest__patch);
router.patch("/initiate/:id", initiateContest__patch);
router.delete("/delete/:id", deleteContest__delete);
router.get("/:id", getContest__get);
router.get("/:id/addProblem", addProblem__get);
router.get("/:id/addProblem/:pid", addProblemEdit__get);
router.post("/:id/addProblem", addProblem__post);
router.post("/:id/addProblem/:pid", addProblem__patch);
router.patch("/:id/:pid/addTestcase", addTestcase__patch);
router.get("/:id/problem/:pid", getProblem__get);
router.get("/:id/update", getUpdateContest__get);
router.get("/:id/standings" ,getStandings__get);

module.exports = router;
