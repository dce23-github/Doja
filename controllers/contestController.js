const Contest = require("../models/Contest");
const Problem = require("../models/Problem");

const createContest_get = (req, res)=>{
  res.render("contest/create");
}

const createContest__post = async (req, res) => {
  try {
    const {
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
      authorId,
    } = req.body;

    const contest = await Contest.create({
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
      authorId,
    });
    console.log(contest);

    res.status(200).json({ message: "Contest created!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to create contest!" });
  }
};

const getContest__get = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.find({ _id: id });
    if (contest.length === 0) {
      throw Error("contest not found!");
    } else {
      res.status(200).json({ contest });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Contest not found!" });
  }
};

const updateContest__patch = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
      authorId,
    } = req.body;

    const contest = await Contest.find({ _id: id });

    if (contest.length === 0) {
      throw Error("contest does not exists!");
    } else {
      const result = await Contest.updateOne(
        { _id: id },
        {
          $set: {
            startTime,
            endTime,
            description,
            prize,
            organisation,
            contestTitle,
          },
        }
      );

      console.log(result);
      res.status(200).json({ message: "Contest details updated!" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "unable to update contest!" });
  }
};

const initiateContest__patch = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.find({ _id: id });

    if (contest.length === 0) {
      throw Error("no such contest!");
    } else {
      const result = await Contest.updateOne(
        { _id: id },
        {
          $set: {
            isInitiated: true,
          },
        }
      );

      console.log(result);
      res.status(200).json({ message: "contest initiated!" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "no such contest" });
  }
};

const deleteContest__delete = async (req, res) => {
  try {
    const { id } = req.params;

    const contest = await Contest.find({ _id: id });

    if (contest.length === 0) {
      throw Error("no such contest!");
    } else {
      const result = await Contest.deleteOne({ _id: id });
      console.log(result);
      res.status(200).json({ message: "contest deleted!" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "unable to delete contest!" });
  }
};

const addProblem__post = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      statement,
      input,
      output,
      constraints,
      title,
      authorId,
      difficulty,
      timeTaken,
      memoryTaken,
    } = req.body;

    const problem = await Problem.create({
      statement,
      input,
      output,
      constraints,
      title,
      authorId,
      difficulty,
      timeTaken,
      memoryTaken,
    });

    const contest = await Contest.updateOne(
      { _id: id },
      {
        $push: {
          problems: problem._id,
        },
      }
    );

    res.status(200).json({ message: "problem added!" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to add problem" });
  }
};

const addTestcase__patch = async (req, res) => {
  try {
    const { id, pid } = req.params;
    const { input, output } = req.body;

    const problem = await Problem.updateOne(
      { _id: pid },
      {
        $push: {
          testCases: { input, output },
        },
      }
    );

    console.log(problem);

    res.status(200).json({ message: "testcase added" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to add testcase" });
  }
};

module.exports = {
  createContest__post,
  getContest__get,
  initiateContest__patch,
  deleteContest__delete,
  updateContest__patch,
<<<<<<< HEAD
  createContest_get,
=======
  addProblem__post,
  addTestcase__patch,
>>>>>>> 6688692d83d3af6a5677923310b8c53b390beda9
};
