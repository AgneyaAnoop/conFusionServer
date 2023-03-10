var express = require("express");
var router = express.Router();
var passport = require("passport");
const bodyParser = require("body-parser");
var User = require("../models/user.js");
var authenticate = require("../authenticate");
const cors = require("./cors");

router.use(bodyParser.json());

router.get("/", cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next)=> {
  User.find({})
    .then(
      (users) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(users);
      }
    )
    .catch((err) => next(err));
});

/* GET users listing. */

router.post("/signup", cors.corsWithOptions,(req, res, next) => {
  User.register(new User({ username: req.body.username }), req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstName) {
          user.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
          user.lastName = req.body.lastName;
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({ success: true, status: "Registration Successful!" });
        });
        
        });
      }
    }); 
});

router.post("/login",cors.corsWithOptions, passport.authenticate("local",{session:false}),(req, res, next) => {
    var token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.json({ success: true, token: token, status: "You are successfully logged in!" });
});

router.get("/logout", cors.corsWithOptions, (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in!");
    err.status = 403;
    next(err);
  }
});

router.get("/checkJWTToken", cors.corsWithOptions, (req, res) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT invalid!", success: false, err: info });
    } else {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      return res.json({ status: "JWT valid!", success: true, user: user });
    }
  })(req, res);
});


module.exports = router;
