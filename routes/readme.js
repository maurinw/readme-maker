var express         = require("express");
var router          = express.Router();
const { readmesDB } = require("../db");
const createError   = require("http-errors");

router.post("/save", function (req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { title, components, readmeId } = req.body;
  const userId = req.session.user._id;

  if (!title || !components || !Array.isArray(components) || components.length === 0) {
    return res.status(400).json({ error: "Title and components array are required" });
  }

  // Basic validation for component structure
  for (const comp of components) {
      if (typeof comp.key !== 'string' || typeof comp.content !== 'string') {
          return res.status(400).json({ error: "Invalid component structure in array" });
      }
  }

  const dataToSave = {
    userId: userId,
    title,
    components,
    updatedAt: new Date(),
  };

  if (readmeId) {
    readmesDB.update(
      { _id: readmeId, userId: userId },
      { $set: dataToSave },
      {},
      function (err, numReplaced) {
        if (err) return next(err);
        if (numReplaced === 0) {
          return res.status(404).json({ error: "Readme not found or not owned by user" });
        }
        readmesDB.findOne({ _id: readmeId }, (err, updatedDoc) => {
           if (err) return next(err);
           res.json({ success: true, readme: updatedDoc, updated: true });
        });
      }
    );
  } else {
    dataToSave.createdAt = new Date();
    delete dataToSave.updatedAt;
    readmesDB.insert(
      dataToSave,
      function (err, newDoc) {
        if (err) return next(err);
        res.json({ success: true, readme: newDoc, updated: false });
      }
    );
  }
});

router.get("/edit/:readmeId", function (req, res, next) {
  if (!req.session.user) {
    return res.redirect("/auth/login");
  }
  const readmeId = req.params.readmeId;
  const userId = req.session.user._id;

  readmesDB.findOne({ _id: readmeId }, function (err, readme) {
    if (err) return next(err);
    if (!readme) {
      return next(createError(404, "Readme not found"));
    }
    if (readme.userId !== userId) {
       return next(createError(403, "Forbidden"));
    }
    res.render("index", { title: "Edit Readme", showSave: true, readme: readme });
  });
});


router.get("/download", function (req, res, next) {
  const readmeId = req.query.readmeId;
  readmesDB.findOne({ _id: readmeId }, function (err, readme) {
    if (err) return next(err);
    if (!readme) {
      return res.status(404).send("Readme not found");
    }

    let fullContent = "";
    if (readme.components && Array.isArray(readme.components)) {
        fullContent = readme.components.map(comp => comp.content).join("\n\n");
    }

    res.setHeader("Content-disposition", `attachment; filename="${readme.title || 'readme'}.md"`);
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    res.send(fullContent);
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
    if (readme.userId !== req.session.user._id) {
      return res.status(403).send("Forbidden");
    }

    readmesDB.remove({ _id: readmeId }, {}, function (err) {
      if (err) return next(err);
      res.redirect("/profile");
    });
  });
});

module.exports = router;