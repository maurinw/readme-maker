"use strict";

const createError    = require("http-errors");
const path           = require("path");

const express        = require("express");
const cookieParser   = require("cookie-parser");
const logger         = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const session        = require("express-session");

const indexRouter    = require("./routes/index");
const usersRouter    = require("./routes/auth");
const profileRouter  = require("./routes/profile");
const readmeRouter   = require("./routes/readme");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(expressLayouts);
app.set("layout", "layout");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: "shhhh, very secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  res.locals.currentPath = req.path;
  res.locals.readme = null; // Default readme to null
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/auth", usersRouter);
app.use("/profile", profileRouter);
app.use("/readme", readmeRouter);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error", { title: "Error" });
});

module.exports = app;