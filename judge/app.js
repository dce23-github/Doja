require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const PORT = (process.env.PORT+1) || 9000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res)=>{
    const {sub , prob} = req.body;

    const res = runCode(sub, prob)
    res.send(res);
});

server.listen(PORT, () => {
    console.log(`application is running at: http://localhost:${PORT}`);
});

