require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cors = require("cors");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const app = express();
const server = require("http").createServer(app);
const io = require('socket.io')(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

const authRoutes = require("./routes/authRoutes");
const contestRoutes = require("./routes/contestRoutes");
const { userRoutes, socketCreate } = require("./routes/userRoutes");

// const problemRoutes = require("./routes/problemRoutes");

const PORT = process.env.PORT || 3000;
const dbURI = process.env.dbURI;
// if (process.env.NODE_ENV == "production") dbURI = prcoess.env.dbURIl;

mongoose.connect(
  dbURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      server.listen(PORT, (err) => {
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

app.use(cors()); // re-enable after removing CDNs
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.use((req, res, next) => {
  if (req.cookies.jwt) {
    let token = req.cookies.jwt;
    token = jwt.decode(token);
    res.locals.currentUser = token.id;
  }
  else res.locals.currentUser = null;
  next();
});
socketCreate(io);
/* middleware ends here */

/* Auth routes */
app.use("/auth", authRoutes);

/* Contest routes */
app.use("/contest", contestRoutes);

/* Problem routes */
// app.use("/problem", problemRoutes);

/*     User Routes    */
app.use("/user", userRoutes);


app.get("/", async (req, res) => {
  try {
    let user;
    if (res.locals.currentUser)
      user = await User.findById(res.locals.currentUser);
    res.render("home", { user: user || null });
  }
  catch (err) {
    console.log(err);
  }
});


app.get("/submit", (req, res) => {
  const sport = (process.env.PORT+1);
  console.log(sport);
  axios.get(`https://judge:${sport}/`)
    .then(data => {
      console.log(data.data)
      console.log(JSON.stringify(data.data));
      res.send(JSON.stringify(data.data));
    })
    .catch(err => {
      // res.status(500).send(err);
      res.status(500).send("error mf");
    })
})



