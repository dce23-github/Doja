const Contest = require("../models/Contest");
const Running = require("../models/Running");
const Problem = require("../models/Problem");
const User = require("../models/User");
const Team = require("../models/Team");
const Bull = require("bull");
const Submission = require("../models/Submission");
const numWorkers = 5;

const queue = new Bull("contest-queue",
  { redis: { host: process.env.REDIS_ENDPOINT_URI, port: process.env.REDIS_PORT, password: process.env.REDIS_PASSWORD } }
);


addToQueue = async (id, status, time) => {
  if (status === "start") {
    console.log("adding contest");
    console.log(time / (1000 * 60)); ``
    queue.add("contest", { status: "start", id: id }, { delay: time, jobId: String(id) })
      // .then(job => console.log("contest job created : ", job))
      .catch(err => {
        console.log("Error on adding contest initiation job to queue, ", err);
      });
  }
  else {
    console.log("removing contest");
    queue.add("contest", { status: "end", id: id }, { jobId: String(id) + "k", delay: time })
      // .then(job=>console.log(job))
      .catch(err => {
        console.log("Error on adding contest initiation job to queue, ", err);
      });
  }
}

queue.process("contest", numWorkers, async (job) => {
  const id = job.data.id;
  const status = job.data.status;

  if (status === "start") {
    console.log("processing start contest");
    let running = await Running.find({});
    if (running.length === 0) {
      running = new Running({
        contests: [],
      });
    }
    else running = running[0];
    running.contests.push(id);
    await running.save();
    console.log(running.contests);
    return;
  }
  else {
    console.log("processing end contest");
    let running = await Running.find({});
    running = running[0];
    running.contests = running.contests.filter(cid => String(cid) !== String(id));
    const contest = await Contest.findById(id);
    contest.isInitiated = "stop";
    await running.save();
    return;
  }
});


const allContest__get = async (req, res) => {
  let all = await Contest.find({});
  let user;
  if (res.locals.currentUser) {
    user = res.locals.currentUser;
    user = await User.findById(user);
  }
  else user = null;

  all = all.filter(contest => contest.isInitiated === "off");
  res.render("contest/all", { user, all });
}


const runningContest__get = async (req, res) => {
  let running = await Running.find({});
  running = running[0];
  running = await running.populate("contests");

  console.log(running);
  let contests = (running) ? running.contests : null;
  if (!contests) contests = [];

  console.log("running contest : ", contests);
  let user;
  if (res.locals.currentUser) {
    user = res.locals.currentUser;
    user = await User.findById(user);
  }
  else user = null;

  res.render("contest/running", { user, contests });
}

const createContest_get = async (req, res) => {
  let user;
  if (res.locals.currentUser) {
    user = res.locals.currentUser;
    user = await User.findById(user);
  }
  else user = null;
  res.render("contest/create", { user });
}

const addProblem__get = async (req, res) => {
  const { id } = req.params;
  const contest = await Contest.findById(id);
  let user;
  if (res.locals.currentUser) {
    user = res.locals.currentUser;
    user = await User.findById(user);
  }
  else user = null;
  res.render(`contest/addProblem`, { contest, user });
}

const createContest__post = async (req, res) => {
  try {

    let {
      date,
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
    } = req.body;
    const authorId = res.locals.currentUser;
    if (isInitiated === undefined) isInitiated = "off";
    console.log(isInitiated);
    const contest = new Contest({
      date,
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
    if (isInitiated === "on") {
      let dobj = new Date();
      console.log(dobj.toLocaleString());
      const hr = dobj.getHours();
      const mn = dobj.getMinutes();
      const day1 = dobj.getDate();

      let st = contest.startTime;
      dobj = new Date(date + " " + st + " GMT+5:30");
      dobj = new Date(dobj.toLocaleString());
      console.log(dobj.toLocaleString());
      st = dobj.toTimeString();
      console.log(st);
      const day2 = dobj.getDate();
      console.log(day1, day2);

      if (day2 - day1 > 3) {
        res.send("cannot create contest before three days");
      }
      console.log(date, startTime, endTime);

      let time = ((day2 - day1 - 1 > 0) ? day2 - day1 - 1 : 0) * 60 * 60;
      if (day1 != day2) {
        time += (24 * 60 - (hr * 60 + mn)) * 60;
      }
      time *= 1000; // time in miliseconds after which contest should start

      let arr = st.split(":");
      arr.pop();
      let hrst = Number(arr[0]), mnst = Number(arr[1]);
      if (day1 != day2) {
        console.log(day1, day2);
        time += (hrst * 60 * 60 + mnst * 60) * 1000;
      }
      else {
        let x = arr.join("");
        let y = String(mn);
        if (y.length == 1) y = "0" + y;
        y = hr + y;
        console.log(x, y);
        x = Number(x);
        y = Number(y);
        x -= y;
        console.log(x);
        x = String(x);
        let d1, d2;
        while (x.length < 4) x = "0" + x;
        d1 = Number(x.slice(0, 2));
        d2 = Number(x.slice(2, 4));
        console.log(d1, d2);
        time += (d1 * 60 * 60 + d2 * 60) * 1000;
      }

      addToQueue(contest._id, "start", time);

      let end = contest.endTime;
      dobj = new Date(date + " " + end + " GMT+5:30");
      dobj = new Date(dobj.toLocaleString());
      end = dobj.toTimeString();
      console.log(end);

      arr = end.split(":");
      arr.pop();
      let hrend = Number(arr[0]), mnend = Number(arr[1]);
      let x = arr.join("");
      arr = st.split(":"); arr.pop();
      let y = arr.join("");
      console.log(x, y);
      x = Number(x);
      y = Number(y);
      x -= y;
      x = String(x);
      let d1, d2;
      while (x.length < 4) x = "0" + x;
      console.log(x);
      d1 = Number(x.slice(0, 2));
      d2 = Number(x.slice(2, 4));
      console.log(d1, d2);
      time += (d1 * 60 * 60 + d2 * 60) * 1000;
      console.log(time);
      addToQueue(contest._id, "end", time);
    }

    res.redirect(`/contest/${contest._id}`);

  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "failed to create contest!" });
  }
};

const getContest__get = async (req, res) => {
  try {
    const { id } = req.params;
    const query = req.query;
    const contest = await Contest.findById(id).populate("problems");

    if (!contest) {
      throw Error("contest not found!");
    } else {

      const userId = res.locals.currentUser;
      let user;
      if (userId)
        user = await User.findById(userId);

      if (query && query.teamId) {
        const teamId = query.teamId;
        let cond = false;
        contest.registrations.forEach((id) => {
          if (String(id) === String(teamId)) cond = true;
        });
        const team = await Team.findById(teamId).populate("submissions");
        console.log(team, "a yo");
        if (!cond) contest.registrations.push(team._id);
        await contest.save();

        if (String(team.activeContest) !== String(id)) {
          team.activeContest = id;
          team.problemsSolved = [];
          await team.save();
        }

        const userId = res.locals.currentUser;
        const user = await User.findById(userId);
        user.curTeam = teamId;
        await user.save();
      }
      //else user.curTeam = null; // contest is inactive


      res.render("contest/show", { contest: contest, user });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Contest not found!" });
  }
};


const getUpdateContest__get = async (req, res) => {
  try {
    console.log("hello");
    const { id } = req.params;
    const contest = await Contest.findById(id);
    let user = res.locals.currentUser;
    if (String(user) === String(contest.authorId)) {
      user = await User.findById(user);
      res.render("contest/editContest", { contest, user });
    }
    else {
      res.redirect(".");
    }
  }
  catch (err) {
    console.log("Contest not found for update, ", err);
  }
}

const updateContest__patch = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      startTime,
      endTime,
      description,
      prize,
      organisation,
      contestTitle,
      isInitiated,
      date,
    } = req.body;
    if (isInitiated === undefined) isInitiated = "off";
    console.log(isInitiated);
    let contest = await Contest.findById(id);
    const user = res.locals.currentUser;
    if (user !== String(contest.authorId)) {
      res.redirect(".");
      return;
    }

    const problems = contest.problems;
    const registrations = contest.registrations;
    const authorId = contest.authorId;

    if (!contest) {
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
            isInitiated,
            problems,
            registrations,
            authorId,
          },
        }
      );

      if (isInitiated === "on") {
        let dobj = new Date();
        const hr = dobj.getHours();
        const mn = dobj.getMinutes();
        const day1 = dobj.getDate();
        const day2 = new Date(date).getDate();
        // console.log(hr, mn, sec, day, day2);

        if (day2 - day1 > 3) {
          res.send("cannot create contest before three days");
        }

        dobj = new Date();
        let time = ((day2 - day1 - 1 > 0) ? day2 - day1 - 1 : 0) * 60 * 60;
        if (day1 != day2) {
          time += (24 * 60 - (hr * 60 + mn)) * 60;
        }
        time *= 1000; // time in miliseconds after which contest should start

        const st = contest.startTime;
        let arr = st.split(":");
        let hrst = Number(arr[0]), mnst = Number(arr[1]);
        if (day1 != day2)
          time += (hrst * 60 * 60 + mnst * 60) * 1000;
        else {
          let x = hrst + "" + mnst;
          let y = hr + "" + mn;
          console.log(x, y);
          x = Number(x);
          y = Number(y);
          x -= y;
          console.log(x);
          x = String(x);
          let d1, d2;
          while (x.length < 4) x = "0" + x;
          d1 = Number(x.slice(0, 2));
          d2 = Number(x.slice(2, 4));
          console.log(d1, d2);
          time += (d1 * 60 * 60 + d2 * 60) * 1000;
        }
        addToQueue(contest._id, "start", time);
        const end = contest.endTime;
        arr = end.split(":");
        let hrend = Number(arr[0]), mnend = Number(arr[1]);
        let x = hrend + "" + mnend;
        let y = hrst + "" + mnst;
        x = Number(x);
        y = Number(y);
        x -= y;
        x = String(x);
        let d1, d2;
        while (x.length < 4) x = "0" + x;
        d1 = Number(x.slice(0, 2));
        d2 = Number(x.slice(2, 4));
        console.log(d1, d2);
        time += (d1 * 60 * 60 + d2 * 60) * 1000;
        console.log(time);
        addToQueue(contest._id, "end", time);
      }


      contest = await Contest.findById(id);
      res.redirect(`/contest/${id}`);
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
      const user = res.locals.currentUser;
      if (user !== String(contest.authorId))
        res.redirect(".");
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
      const user = res.locals.currentUser;
      if (user !== String(contest.authorId))
        res.redirect(".");

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
    let cont = await Contest.findById(id);
    const user = res.locals.currentUser;
    if (user !== String(cont.authorId))
      res.redirect(".");

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

    sampleCaseOutput.forEach((sc, i) => {
      sc = String(sc).trim();
      sampleCaseOutput[i] = String(sc).split("\r").join("");
    });

    testCaseOutput.forEach((sc, i) => {
      sc = String(sc).trim();
      testCaseOutput[i] = String(sc).split("\r").join("");
    })

    const testCases = [];
    const sampleCases = [];
    testCaseInput.forEach((tci, i) => {
      if (i != 0)
        testCases.push({
          input: tci,
          output: testCaseOutput[i],
        });
    });

    sampleCaseInput.forEach((sci, i) => {
      if (i != 0)
        sampleCases.push({
          input: sci,
          output: sampleCaseOutput[i],
        });
    });

    // console.log(sampleCases);
    // console.log(testCases);
    // let contest = Contest.findById(id);
    const sno = cont.problems.length + 1;
    const problem = await Problem.create({
      sno,
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
      contestId: id,
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
  let user = res.locals.currentUser;
  if (String(user) !== String(contest.authorId))
    res.redirect(".");
  user = await User.findById(user);
  res.render("contest/editProblem", { contest, problem, user });
}

const addProblem__patch = async (req, res) => {
  
  try {
    const { id, pid } = req.params;
    let cont = await Contest.findById(id);
    const user = res.locals.currentUser;
    if (String(user) !== String(cont.authorId))
      res.redirect(".");

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

    sampleCaseOutput.forEach((sc, i) => {
      sc = String(sc).trim();
      sampleCaseOutput[i] = String(sc).split("\r").join("");
    });

    testCaseOutput.forEach((sc, i) => {
      sc = String(sc).trim();
      testCaseOutput[i] = String(sc).split("\r").join("");
    })

    const testCases = [];
    const sampleCases = [];
    testCaseInput.forEach((tci, i) => {
      if (i != 0)
        testCases.push({
          input: tci,
          output: testCaseOutput[i],
        });
    });

    sampleCaseInput.forEach((sci, i) => {
      if (i != 0)
        sampleCases.push({
          input: sci,
          output: sampleCaseOutput[i],
        });
    });

    // console.log(sampleCases);
    // console.log(testCases);
    // let contest = Contest.findById(id);
    const sno = cont.problems.length + 1;
    const problem = await Problem.findByIdAndUpdate(pid, {
      sno,
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
      contestId: id,
    });

    const contest = await Contest.findById(id);
    res.redirect(`/contest/${contest._id}`);

  }
  catch (error) {
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
  let user = null;
  let team = null;
  let submissions = [];
  if (res.locals.currentUser) {
    user = await User.findById(res.locals.currentUser).populate("submissions");
    if (user.curTeam !== "undefined" && user.curTeam && contest.isInitiated === "on") {
      console.log("inside team submissions")
      team = await Team.findById(user.curTeam).populate("submissions");
      console.log(user.curTeam);
      for (let sub of team.submissions) {
        let arr = {};
        arr.type = sub.type;
        arr.verdict = sub.verdict;
        arr.sno = sub.sno;
        submissions.push(arr);
      }
    }
    else {

      if (user.submissions !== undefined && user.submissons !== null && user.submissions.length > 0)
        for (let sub of user.submissions) {
          if (String(sub.probId) === pid) {
            let arr = {};
            arr.type = sub.type;
            arr.verdict = sub.verdict;
            arr.sno = sub.sno;
            submissions.push(arr);
          }
        }
    }
  }

  console.log(user);

  res.render("contest/showProblem", { contest, problem, user, team, submissions });
}


const getStandings__get = async (req, res) => {

  const { id } = req.params;
  const contest = await Contest.findById(id);

  if (contest) {
    const teams = contest.registrations;
    console.log(teams);
    const arr = [];
    for (let teamId of teams) {
      const team = await Team.findById(teamId);
      let mxhr = -100, mxmn = -100, mxsec = -100;
      const sn = [];
      console.log(team.problemsSolved);
      for (let submis of team.problemsSolved) {
        const subId = submis.subId;
        const sno = submis.sno;
        const sub = await Submission.findById(subId);
        const date = new Date(sub.createdAt);
        const hr = date.getHours();
        const mn = date.getMinutes();
        const sec = date.getSeconds();
        if (hr > mxhr || hr === mxhr && mn > mxmn || hr === mxhr && mn === mxmn && sec > mxsec) {
          mxhr = hr, mxmn = mn, mxsex = sec;
        }
        sn.push(sno);
      }

      arr.push({
        teamName: team.name,
        cnt: team.problemsSolved.length,
        hr: mxhr,
        sec: mxsec,
        mn: mxmn,
        snos: sn,
      });
    }

    arr.sort((a, b) => {
      if (a.cnt < b.cnt) return 1;
      else if (a.cnt > b.cnt) return -1;
      else {
        if (a.hr < b.hr || a.hr === b.hr && a.mn < b.mn || a.hr == b.hr && a.mn == b.mn && a.sec < b.sec) return 1;
        else if (a.hr > b.hr || a.mn > b.mn || a.sec > b.sec) return -1;
        else return 0;
      }
    });

    let user;
    if (res.locals.currentUser) {
      user = res.locals.currentUser;
      user = await User.findById(user);
    }
    else user = null;
    res.render("contest/standings", { contest, arr: arr, user });

  }
  else {
    res.json({ status: "contest not found" });
  }


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
  getUpdateContest__get,
  runningContest__get,
  getStandings__get
};
