var express = require("express");
var router  = express.Router();
const { readmesDB } = require("../db");

router.get("/", function (req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  readmesDB.find({ userId: req.session.user._id }).sort({ createdAt: -1 }).exec(function (err, readmes) {
    if (err) return next(err);
    res.render("profile/profile", { title: "Profile", readmes });
  });
});

module.exports = router;