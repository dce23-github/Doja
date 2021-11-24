const Bull = require("bull");
const numWorkers = 5;
const Submission = require("../models/Submission");
const Problem = require("../models/Problem");

const queue = new Bull("producer-queue");
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
            const res = await runCode(sub, prob); // change this to a fetch call
            res.status = "finished";
            console.log(res);
            await res.save();
            return true;
        }
        catch (err) {
            sub.status = "internal error";
            await sub.save();
            // done();
            throw new Error(JSON.stringify(err));
        }
    }



}));

Q.add = async function (subId) {
    queue.add({ id: subId }, {jobId : String(subId)}) // await removed
    .catch(err=> console.log(err));
    // return job;
}


queue.on("failed", (error) => {
    console.error(error.data.id, error.failedReason);
});

module.exports = Q;


