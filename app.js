"use strict";

/** Express app for message.ly. */


const express = require("express");
const cors = require("cors");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("./middleware/auth");

const { NotFoundError } = require("./expressError");
const app = new express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded());

// allow connections to all routes from any browser
app.use(cors());

// get auth token for all routes
app.use(authenticateJWT);


/** routes */

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");

app.use("/auth", authRoutes);
app.use("/users", ensureLoggedIn, userRoutes); //TODO: not all routes require logged in user
app.use("/messages", ensureLoggedIn, messageRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});




module.exports = app;
