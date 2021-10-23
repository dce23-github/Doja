require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();

const authRoutes = require("./routes/authRoutes");
const contestRoutes = require("./routes/contestRoutes");
// const problemRoutes = require("./routes/problemRoutes");

const PORT = process.env.PORT || 9000;
const dbURI = process.env.dbURI;
// if (process.env.NODE_ENV == "production") dbURI = prcoess.env.dbURIl;

mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      app.listen(PORT, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`Server is running on ${PORT} and connected to mongoDB`);
        }
      });
    }
  }
);

/* configuration */

app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

/* configuration ends here */

/* middlewares */

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

/* middleware ends here */

/* Auth routes */
app.use("/user", authRoutes);

/* Contest routes */
app.use("/contest", contestRoutes);

/* Problem routes */
// app.use("/problem", problemRoutes);

app.get("/", (req, res) => {
  res.render("home");
});
