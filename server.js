/* EXPRESS SETUP */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const mongoose = require("mongoose");
const router = require("./routes/index");
const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false
});
const corsOptions = {
  credentials: true,
  origin: ["http://localhost:3000"]
};
const app = express();

/* Middleware */
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

/* DB connection */
mongoose.connect("mongodb://localhost:27017/cxo", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

/* ROUTES */
app.use("/", router);

const port = process.argv[2] || 1024;
app.listen(port, () => console.log("App listening on port " + port));
