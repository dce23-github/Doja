require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const app = express();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res)=>{
    console.log("hello from server");
    res.send({msg : "recieved on container server"});
});

server.listen(PORT, () => {
    console.log(`application is running at: http://localhost:${PORT}`);
});

