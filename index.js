/* EXPRESS SETUP */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const expressSession = require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false
});
const passport = require("passport");
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const ensureLoggedIn = require("./middleware/ensureLoggedIn");

const corsOptions = {
  credentials: true,
  origin: ['http://localhost:3000']
}

const app = express();

/* Middleware */
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/MyDatabase", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Schema = mongoose.Schema;
const UserDetail = new Schema({
  username: String,
  password: String,
});
UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model("userInfo", UserDetail, "userInfo");

passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

/* ROUTES */
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect(`/login?info=${info}`);

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/");
    });
  })(req, res, next);
});

app.get("/cart", ensureLoggedIn(401), (req, res) => {
  res.status(200).send("LoggedIn");
});

app.get("/", ensureLoggedIn(401), (req, res) => {
  res.sendStatus
});

app.get("/private", ensureLoggedIn(401), (req, res) => {

});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/login"));
});

const port = process.argv[2] || 1024;
app.listen(port, () => console.log("App listening on port " + port));
