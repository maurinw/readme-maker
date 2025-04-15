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

module.exports = router;
