"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");

let test1UserToken;
let test2USerToken;
let m1Id;
let m2Id;

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

    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155551211",
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "Sup bro, this is a test from test1."
    })

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "Hello my brother, this is test2."
    })

    test1UserToken = jwt.sign(u1, SECRET_KEY);
    test2USerToken = jwt.sign(u2, SECRET_KEY);
    m1Id = m1.id;
    m2Id = m2.id;
  });

  /**GET / returns a list of all users */

  describe("GET /users", function () {
    test("can see a list", async function () {
      const response = await request(app)
        .get(`/users`)
        .query({ _token: test1UserToken });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        users: [{
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
        },
        {
          username: "test2",
          first_name: "Test2",
          last_name: "Testy2",
        }]
      });
    });
  });

  /**Get / returns info about an user */

  describe("GET /users/username", function () {
    test("can see user info", async function() {
      const response = await request(app)
        .get(`/users/test1`)
        .query({ _token: test1UserToken });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
          user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000",
            join_at: expect.any(String),
            last_login_at: null
          }
        });
    });
  });

  /** GET returns list of messages to the user */
  describe("GET /users/:username/to", function() {
    test("can see user info", async function() {
      const response = await request(app)
        .get(`/users/test1/to`)
        .query({ _token: test1UserToken });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
          messages: [{
            id: m2Id,
            body: "Hello my brother, this is test2.",
            sent_at: expect.any(String),
            read_at: null,
            from_user : {
              username: "test2",
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155551211"
            }
          }]
        });
      });
  });


  /** GET returns list of messages from the user */
  describe("GET /users/:username/from", function() {
    test("can see user info", async function() {
      const response = await request(app)
        .get(`/users/test1/from`)
        .query({ _token: test1UserToken });

        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
          messages: [{
            id: m1Id,
            body: "Sup bro, this is a test from test1.",
            sent_at: expect.any(String),
            read_at: null,
            to_user : {
              username: "test2",
              first_name: "Test2",
              last_name: "Testy2",
              phone: "+14155551211"
            }
          }]
        });
      });
  });
});

afterAll(async function () {
  await db.end();
});