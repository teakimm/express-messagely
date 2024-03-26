"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

let test1UserToken;
let test2UserToken;
let test3UserToken;
let m1Id;
let m2Id;

describe("Message Routes Test", function () {

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

    let u3 = await User.register({
      username: "test3",
      password: "password",
      first_name: "Test3",
      last_name: "Testy3",
      phone: "+14155551222",
    });

    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "Sup bro, this is a test from test1."
    });

    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "Hello my brother, this is test2."
    });

    test1UserToken = jwt.sign(u1, SECRET_KEY);
    test2UserToken = jwt.sign(u2, SECRET_KEY);
    test3UserToken = jwt.sign(u3, SECRET_KEY);

    m1Id = m1.id;
    m2Id = m2.id;
  });

  /** GET returns detail of message given a url param of message id */
  describe("GET /messages/:id", function () {
    test("can see message info as correct user", async function () {
      const response = await request(app)
        .get(`/messages/${m1Id}`)
        .query({ _token: test1UserToken });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        message: {
          id: m1Id,
          body: "Sup bro, this is a test from test1.",
          sent_at: expect.any(String),
          read_at: null,
          from_user: {
            username: "test1",
            first_name: "Test1",
            last_name: "Testy1",
            phone: "+14155550000"
          },
          to_user: {
            username: "test2",
            first_name: "Test2",
            last_name: "Testy2",
            phone: "+14155551211",
          }
        }
      });
    });

    test("cannot see message info as incorrect user", async function () {
      const response = await request(app)
        .get(`/messages/${m1Id}`)
        .query({ _token: test3UserToken });

      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        error: { message: "Unauthorized", status: 401 }
      });
    });
  });

  /** POST create a message */
  describe("POST /messages", function () {
    test("can create a message", async function () {
      const response = await request(app)
        .post(`/messages`)
        .send({
          to_username: "test2",
          body: "Hello user2, this is a test message."
        })
        .query({ _token: test1UserToken });

      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        message: {
          id: expect.any(Number),
          from_username: "test1",
          to_username: "test2",
          body: "Hello user2, this is a test message.",
          sent_at: expect.any(String)
        }
      });
    });

    test("cannot create a message without login", async function () {
      const response = await request(app)
        .post(`/messages`)
        .send({
          to_username: "test2",
          body: "Hello user2, this is a test message."
        })

      expect(response.statusCode).toEqual(401);
      expect(response.body).toEqual({
        error: { message: "Unauthorized", status: 401 }
      });
    });
    });
  });

    /** POST read a message */
    describe("POST /messages/:id/read", function () {
      test("can see read a message", async function () {
        const response = await request(app)
          .post(`/messages/${m2Id}/read`)
          .query({ _token: test1UserToken });

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
          message: {
            id: m2Id,
            read_at: expect.any(String)
          }
        });
      });
    });
  //});










});

afterAll(async function () {
  await db.end();
});