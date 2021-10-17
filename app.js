require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const PORT = process.env.PORT || 9000;

mongoose.connect(process.env.dbURI, (err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(PORT, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Server is running on ${PORT}`);
      }
    });
  }
});

/* middlewares */

/* routes */

app.get("/", (req, res) => {
  res.send("<h1>This is working!</h1>");
});
