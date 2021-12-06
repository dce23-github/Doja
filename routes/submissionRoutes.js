const express = require("express");
// const { problem__get } = require("../controllers/problemController");
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const Team = require("../models/Team");
const User = require("../models/User")
const Contest = require("../models/Contest");
const router = express.Router();


const Q = require("../util/queue");
const genFile = require("../util/genFile");



router.post("/:id/:pid", async (req, res) => {
    const { id, pid } = req.params; // problem id
    const code = req.body.code;
    const lang = req.body.lang;
    const type = req.body.type;
    const sno = req.body.sno;
    const contestType = req.body.contestType;

    let teamId = null, userId = null;
    let subBy;
    if (contestType === "on") teamId = id, subBy = "team";
    else userId = id, subBy = "user";

    if (code === undefined) return res.status(400).send({ status: "code absent" });
    else {
        // const prob = await Problem.findById(pid);
        try {
            const problem = await Problem.findById(pid);
            console.log("sub contestid : ",problem.contestId);
            const contest = await Contest.findById(problem.contestId);
            const sub = new Submission({
                "userId": userId,
                probId: pid,
                probTitle : problem.title,
                contestId : problem.contestId,
                contestTitle : contest.contestTitle,
                "code": code,
                "lang": lang,
                type: type,
                teamId: teamId,
                submittedBy: subBy,
                sno,
            });
            await sub.save();
            Q.add(sub._id);
            res.send({ status: "OK", subId: sub._id });
        }
        catch (err) {
            console.log(err);
            res.send({ status: "Error", err });
        }
    }
});

router.get("/:subId", async (req, res) => {

    const { subId } = req.params;
    const sub = await Submission.findById(subId);

    if (sub === undefined) {
        res.status(400).send({ status: "invalid subId" });
    }
    else {
        if (sub.status === "finished") {
            const userId = sub.userId;
            const teamId = sub.teamId;
            const probId = sub.probId;
            const problem = await Problem.findById(probId);
            const contest = await Contest.findById(sub.contestId);
            let ac = 0;
            for (let ver of sub.verdict) {
                if (ver === "AC") ac++;
            }
            if (ac === sub.verdict.length) {
                sub.accepted = "passed";
                await sub.save();
            }
            else {
                sub.accepted = "failed";
                await sub.save();
            }

            if (sub.type === "test") {
                if (sub.accepted === "passed" && String(userId) !== String(contest.authorId) ) problem.countAc = problem.countAc + 1;
                await problem.save();

                if (teamId !== null) {
                    const team = await Team.findById(teamId).populate("problemsSolved");
                    if (!team.problemsSolved.some(sub => sub.sno === problem.sno)) {
                        team.submissions.push(subId);
                        await team.save();

                        for (let id of team.members) {
                            const user = await User.findById(id);
                            user.submissions.push(subId);
                            await user.save();
                        }

                        if (sub.accepted === "passed") {
                            team.problemsSolved.push({
                                sno: problem.sno || 2,
                                subId: subId,
                            });
                            await team.save();
                        }
                    }
                }
                else {
                    const user = await User.findById(userId);
                    user.submissions.push(subId);
                    console.log("inside sub route: ",user.submissions);
                    await user.save();
                }
            }

            res.send({ status: sub.status, sub });
        }
        else if (sub.status == "internal error") {
            res.send({ status: sub.status });
        }
        else {
            res.send({ status: "processing" });
        }
    }
})


module.exports = { submissionRoutes: router };