"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(
      `INSERT INTO users (username,
                          password
                          first_name
                          last_name
                          phone
                          join_at
                          last_login_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]
    );
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]
    );
    const userData = result.rows[0];
    const userPassword = userData.password;
    if (userData) {
      if (await bcrypt.compare(password, userPassword)) {
        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
       SET last_login_at = current_timestamp
        WHERE username = $1`,
      [username]
    );
    const userData = result.rows[0];

    if (!userData) throw new NotFoundError(`${username} does not exist.`);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username
              first_name
              last_name
       FROM users`
    );
    const users = result.rows;

    if (!users) throw new NotFoundError(`No users found`);

    return users;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username
              first_name
              last_name
              phone
              join_at
              last_login_at
       FROM users
       WHERE username = $1`,
       [username]
    );
    const user = result.rows[0];

    if(!user) throw new NotFoundError(`Could not find ${username}.`);

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const result = await db.query(
      `SELECT m.id
              m.to_user
              m.body
              m.sent_at
              m.read_at
      FROM messages AS m
      JOIN users AS u
      ON m.from_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );
    const messages = result.rows;

    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT m.id
              m.from_user
              m.body
              m.sent_at
              m.read_at
      FROM messages AS m
      JOIN users AS u
      ON m.from_username = u.username
      WHERE m.from_username = $1`,
      [username]
    );
    const messages = result.rows;

    return messages;
  }
}


module.exports = User;
