var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  if (res.locals.readme) {
     res.render("index", { title: "Edit Readme", showSave: true, readme: res.locals.readme });
  } else {
     res.render("index", { title: "Home", showSave: true, readme: null });
  }
});

module.exports = router;