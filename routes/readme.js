var express         = require("express");
var router          = express.Router();
const { readmesDB } = require("../db");

// POST /readme/save - save a new readme (must be logged in)
router.post("/save", function (req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { title, content } = req.body;
  readmesDB.insert(
    {
      userId: req.session.user._id,
      title,
      content,
      createdAt: new Date(),
    },
    function (err, newDoc) {
      if (err) return next(err);
      res.json({ success: true, readme: newDoc });
    }
  );
});

// GET /readme/download - download a readme by its ID (public route)
router.get("/download", function (req, res, next) {
  const readmeId = req.query.readmeId;
  readmesDB.findOne({ _id: readmeId }, function (err, readme) {
    if (err) return next(err);
    if (!readme) {
      return res.status(404).send("Readme not found");
    }
    // Set headers to prompt download as a Markdown file.
    res.setHeader("Content-disposition", 'attachment; filename="readme.md"');
    res.setHeader("Content-Type", "text/markdown");
    res.send(readme.content);
  });
});

router.post("/delete", function (req, res, next) {
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  const readmeId = req.body.readmeId;
  readmesDB.findOne({ _id: readmeId }, function (err, readme) {
    if (err) return next(err);
    if (!readme) {
      return res.status(404).send("Readme not found");
    }
    // Only allow owner to delete
    if (readme.userId !== req.session.user._id) {
      return res.status(403).send("Forbidden");
    }

    readmesDB.remove({ _id: readmeId }, {}, function (err /*, numRemoved */) {
      if (err) return next(err);
      // Redirect back to profile after deletion
      res.redirect("/profile");
    });
  });
});

module.exports = router;
