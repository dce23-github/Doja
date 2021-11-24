const express = require("express");
// const { problem__get } = require("../controllers/problemController");
const Submission  = require("../models/Submission");
// const Problem = require("../models/Problem");
const router = express.Router();


const Q = require("../util/queue");
const genFile = require("../util/genFile");



router.post("/:userId/:pid", async (req, res) => {
    const { userId, pid } = req.params; // problem id
    const code = req.body.code;
    const lang = req.body.lang;
    const type = req.body.type;
    
    if (code === undefined) return res.status(400).send({ status: "NOK" });
    else {
        // const prob = await Problem.findById(pid);
        const sub = new Submission({
            "userId": userId,  // uncomment
            probId: pid,
            "code": code,
            "lang": lang,
            type : type,
        });
        await sub.save();
        Q.add(sub._id);
        res.send({ status: "OK", subId: sub._id });
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
            res.send({status : sub.status,sub});
        }
        else if(sub.status == "inernal erro"){
            res.send({status : sub.status});
        }
        else {
            res.send({ status: "processing" });
        }
    }
})


module.exports = {submissionRoutes:router};