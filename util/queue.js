const Bull = require("bull");
const numWorkers = 5;
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const axios = require("axios");
const  fetch =  require("node-fetch")
// import fetch from "node-fetch"

const queue = new Bull("producer-queue",
    { redis: { host: process.env.REDIS_ENDPOINT_URI, port: process.env.REDIS_PORT, password: process.env.REDIS_PASSWORD } }
);
const { runCode } = require("./run.js"); // change this to a fetch call
const Q = {};

queue.process(numWorkers, (async (job) => {
    // console.log("inside processing");
    const subId = job.data.id;
    const sub = await Submission.findById(subId);
    const prob = await Problem.findById(sub.probId);

    if (!sub) throw new Error("can not find submission with id:", subId);
    else {
        // run code and set verdict

        try {
            // const res = await runCode(sub, prob); // change this to a fetch call
            // res.status = "finished";
            // console.log(res);
            // await res.save();
            
            const payload = {sub, prob};
            let resp = await fetch("https://pure-coast-94262.herokuapp.com/",{
                method : "post",
                body : JSON.stringify(payload) ,
                headers: {'Content-Type': 'application/json'}
            });
            
            
            data = await resp.json();
            sub.output = data.output;
            sub.verdict = data.verdict;
            sub.status = data.status;
            sub.time = data.time;
            sub.memory = data.memory;
            console.log(sub);
            await sub.save();
            
            return true;
        }
        catch (err) {
            // sub.status = "internal error";
            // await sub.save();
            // done();
            console.log("eroro alert", err);
            throw new Error(JSON.stringify(err));
        }
    }



}));

Q.add = async function (subId) {
    queue.add({ id: subId }, { jobId: String(subId) }) // await removed
        .catch(err => console.log(err));
    // return job;
}


queue.on("failed", (error) => {
    console.error(error.data.id, error.failedReason);
});

module.exports = Q;


