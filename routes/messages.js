"use strict";

const Router = require("express").Router;
const router = new Router();
const Message = require("../models/message");
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const { BadRequestError, UnauthorizedError } = require("../expressError");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  const message = await Message.get(req.params.id);

  if (res.locals.user.username !== message.from_user.username
    && res.locals.user.username !== message.to_user.username) {
    throw new UnauthorizedError();
  }

  return res.json({ message });
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { to_username, body } = req.body;

  const from_username = res.locals.user.username;

  const messageData = await Message.create({ from_username, to_username, body });

  return res.status(201).json({ message: messageData });

});


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureCorrectUser, async function (req, res, next) {
  const readData = await Message.markRead(req.params.id);

  const message = await Message.get(req.params.id);

  if (res.locals.user.username !== message.to_user.username) {
    throw new UnauthorizedError();
  }

  return res.json({ message: readData });
});


module.exports = router;