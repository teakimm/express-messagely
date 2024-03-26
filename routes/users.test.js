"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

let testUserToken;

describe("Users Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });

    testUserToken = jwt.sign(u1, SECRET_KEY);
  });

  /**GET / returns a list of all users */

describe("GET /users", function () {
  test("can see a list", async function () {
    const response = await request(app)
      .get(`/users`)
      .query({ _token: testUserToken });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      users: [{
        user: {
          username: "test1",
          password: "password",
          first_name: "Test1",
          last_name: "Testy1",
          phone: "+14155550000",
        }
      }]
    });
  });
});