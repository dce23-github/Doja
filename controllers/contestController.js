const Contest = require("../models/Contest");
const Problem = require("../models/Problem");


const allContest__get = async (req, res) => {
  const all = await Contest.find({});
  let user;
  if (res.locals.currentUser) user = res.locals.currentUser;
  else user = null;

  res.render("contest/all", { user, all });
}

const createContest_get = (req, res) => {
  res.render("contest/create");
}

const addProblem__get = async (req, res) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);
  res.render(`contest/addProblem`, { contest });
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
    } = req.body;
    const authorId = res.locals.currentUser;


    const contest = new Contest({
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
      authorId,
    });

    await contest.save();
    res.redirect(`/contest/${contest._id}`);

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to create contest!" });
  }
};

const getContest__get = async (req, res) => {
  try {
    const { id } = req.params;
    const contest = await Contest.findById(id).populate("problems");

    if (contest.length === 0) {
      throw Error("contest not found!");
    } else {
      res.render("contest/show", { contest: contest });
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
      // authorId,
      difficulty,
      timeLimit,
      memoryLimit,
      // image,
      testCaseInput,
      testCaseOutput,
      sampleCaseInput, 
      sampleCaseOutput,
    } = req.body;
    const authorId = res.locals.currentUser;
    
    console.log(testCaseInput.length, sampleCaseInput.length);
    console.log(sampleCaseInput[1]);

    const testCases = [];
    const sampleCases = [];
    testCaseInput.forEach((tci, i)=>{
      if(i !=0)
      testCases.push({
        input : tci,
        output : testCaseOutput[i],
      });
    });

    sampleCaseInput.forEach((sci, i)=>{
      if(i !=0)
      sampleCases.push({
        input : sci,
        output : sampleCaseOutput[i],
      });
    });

    console.log(sampleCases);
    console.log(testCases);

    const problem = await Problem.create({
      statement,
      input,
      output,
      constraints,
      title,
      authorId,
      difficulty,
      timeLimit,
      memoryLimit,
      testCases,
      sampleCases,
    });

    const contest = await Contest.findByIdAndUpdate(
      id,
      {
        $push: {
          problems: problem._id,
        },
      }
    );
    

    res.redirect(`/contest/${contest._id}`);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to add problem" });
  }
};

const addProblemEdit__get = async (req, res) => {
  const { id, pid } = req.params;
  const contest = await Contest.findById(id);
  const problem = await Problem.findById(pid);
  res.render("contest/editProblem", { contest, problem });
}

const addProblem__patch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      statement,
      input,
      output,
      constraints,
      title,
      // authorId,
      difficulty,
      timeLimit,
      memoryLimit,
      testCases,
      sampleCases,
    } = req.body;
    const authorId = res.locals.currentUser;

    const problem = await Problem.UdpateOne(
      { _id: id },
      {
        statement,
        input,
        output,
        constraints,
        title,
        authorId,
        difficulty,
        timeLimit,
        memoryLimit,
      });

    res.redirect(`/contest/${contest._id}`);
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


const getProblem__get = async (req, res) => {
  const { id, pid } = req.params;
  const contest = await Contest.findById(id);
  const problem = await Problem.findById(pid);
  console.log(problem.sampleCases[0]);
  res.render("contest/showProblem", {contest, problem});
}

module.exports = {
  createContest__post,
  getContest__get,
  initiateContest__patch,
  deleteContest__delete,
  updateContest__patch,
  createContest_get,
  addProblem__post,
  addTestcase__patch,
  addProblem__get,
  allContest__get,
  addProblem__patch,
  addProblemEdit__get,
  getProblem__get,
};
