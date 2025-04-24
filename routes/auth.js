var express       = require("express");
var bcrypt        = require("bcryptjs");
var router        = express.Router();
const { usersDB } = require("../db");

// GET login page
router.get("/login", function (req, res, next) {
  res.render("auth/login", { title: "Login", error: null });
});

// GET register page
router.get("/register", function (req, res, next) {
  res.render("auth/register", { title: "Register", error: null });
});

// POST registration handler
router.post("/register", function (req, res, next) {
  const { username, password, confirm_password } = req.body;

  // 1) make sure all three fields are present
  if (!username || !password || !confirm_password) {
    return res.render("auth/register", {
      title: "Register",
      error: "Please provide username, password, and confirmation."
    });
  }

  // 2) check that password === confirm_password
  if (password !== confirm_password) {
    return res.render("auth/register", {
      title: "Register",
      error: "Passwords do not match."
    });
  }

  // 3) now check if user exists
  usersDB.findOne({ username: username }, function (err, user) {
    if (err) return next(err);
    if (user) {
      return res.render("auth/register", {
        title: "Register",
        error: "Username already taken."
      });
    }
    // 4) hash & insert
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) return next(err);
      usersDB.insert(
        { username: username, password: hash },
        function (err, newUser) {
          if (err) return next(err);
          req.session.user = newUser;
          res.redirect("/");
        }
      );
    });
  });
});


// POST login handler
router.post("/login", function (req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render("auth/login", {
      title: "Login",
      error: "Please enter both username and password.",
    });
  }
  // Look up the user in the database
  usersDB.findOne({ username: username }, function (err, user) {
    if (err) return next(err);
    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        error: "Invalid username or password.",
      });
    }
    // Compare the submitted password with the hashed password
    bcrypt.compare(password, user.password, function (err, result) {
      if (err) return next(err);
      if (result) {
        req.session.user = user;
        res.redirect("/");
      } else {
        return res.render("auth/login", {
          title: "Login",
          error: "Invalid username or password.",
        });
      }
    });
  });
});

// GET logout handler
router.get("/logout", function (req, res, next) {
  req.session.destroy(function (err) {
    if (err) return next(err);
    res.redirect("/");
  });
});

module.exports = router;
