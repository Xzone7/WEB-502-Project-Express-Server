const express = require("express");
const ensureLoggedIn = require("../middleware/ensureLoggedIn");
const passport = require("passport");
const UserDetails = require("../schema/UserDetail");

const router = express.Router();

/* Passport Registration */
passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({
        status: "Bad Request",
        payload: {
          isLoggedIn: false
        }
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        status: "Success",
        payload: {
          isLoggedIn: true
        }
      });
    });
  })(req, res, next);
});

router.get("/cart", ensureLoggedIn(), (req, res) => {
  res.status(200).send("LoggedIn");
});

router.get("/", ensureLoggedIn(), (req, res) => {

});

router.get("/private", ensureLoggedIn(), (req, res) => {

});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({
      status: "Success",
      payload: {
        isLoggedIn: false
      }
    });
  });
});

router.all("*", (req, res) => {
  res.status(404).send("<h1>Page Not Found</h1>");
});

module.exports = router;