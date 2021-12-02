const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require("fs");
const path = require("path");

const p = __dirname.slice(0, __dirname.lastIndexOf("/"));
console.log(p);
const storePath = path.join(p, "store");
if (!fs.existsSync(storePath)) {
    fs.mkdirSync(storePath, { recursive: true });
}

const runCode = async function (sub, prob) {
    console.log("running");

    const name = String(sub._id);
    const solution = (name + "_sol." + sub.lang);
    fs.closeSync(fs.openSync(path.join(storePath, solution), "w"));
    fs.writeFileSync(path.join(storePath, solution), sub.code);
    const testcase = (name + `_test.txt`);
    
    const timeMemory = (name + `_tm.txt`);
    const verdict = (name + `_verdict.txt`);
    const output = (name + `_out.txt`);
    let solrun = (name + "_sol");
    fs.closeSync(fs.openSync(path.join(storePath, timeMemory), "w"));
    fs.closeSync(fs.openSync(path.join(storePath, verdict), "w"));
    fs.closeSync(fs.openSync(path.join(storePath, output), "w"));
    fs.closeSync(fs.openSync(path.join(storePath, testcase), "w"));
    

    const result = [];
    for (let i = 0; i < Math.max(prob.testCases.length, prob.sampleCases.length); i++) {
        console.log("at ", i);
        if (sub.type === "test" && i >= prob.testCases.length) break;
        else if (sub.type === "sample" && i >= prob.sampleCases.length) break;

        fs.writeFileSync(path.join(storePath, testcase), ((sub.type === "sample") ? prob.sampleCases[i].input : prob.testCases[i].input));
        fs.writeFileSync(path.join(storePath, timeMemory), "");
        fs.writeFileSync(path.join(storePath, verdict), "");
        fs.writeFileSync(path.join(storePath, output), "");
        
        const res = {};
        const expOut = ((sub.type === "sample") ? prob.sampleCases[i].output : prob.testCases[i].output);
        

        const { err, stdout, stderr } = await exec(`cd ${storePath} && ./run.sh ${sub.lang} ${output} ${timeMemory} ${prob.timeLimit} ${prob.memoryLimit} ${verdict} ${solution} ${testcase} ${solrun}`);
        if (!(err || stderr)) {
            const acOut = fs.readFileSync(path.join(storePath, output)).toString().trim();
            const tm = fs.readFileSync(path.join(storePath, timeMemory)).toString().trim();
            const ver = fs.readFileSync(path.join(storePath, verdict)).toString().trim();
            
            res.output = acOut;
            if (ver === "valid") {
                console.log(JSON.stringify(acOut), JSON.stringify(expOut));
                if (acOut == expOut) res.verdict = "AC";
                else res.verdict = "WA";
                const arr = tm.split(" ");
                res.time = arr[0];
                res.memory = arr[1];
            }
            else { // for TLE, MLE, CE
                res.verdict = ver;
                res.time = 0;
                res.memory = 0;
            }

            console.log(res);
            result.push(res);
        }
        else{
            console.log(err);
            console.log(stderr);
        }

    }


    result.forEach(res => {
        sub.output.push(res.output);
        sub.verdict.push(res.verdict);
        sub.time.push(res.time);
        sub.memory.push(res.memory);
    });

    fs.unlinkSync(path.join(storePath, solution));
    fs.unlinkSync(path.join(storePath, output));
    fs.unlinkSync(path.join(storePath, testcase));
    fs.unlinkSync(path.join(storePath, timeMemory));
    fs.unlinkSync(path.join(storePath, verdict));
    

    return sub;
}


module.exports = { runCode };


