var express = require("express");
var router  = express.Router();
const { readmesDB } = require("../db");

router.get("/", function (req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  // Find saved readmes belonging to this user
  readmesDB.find({ userId: req.session.user._id }, function (err, readmes) {
    if (err) return next(err);
    res.render("profile/profile", { title: "Profile", readmes });
  });
});

module.exports = router;
