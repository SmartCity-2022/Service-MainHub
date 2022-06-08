const app = require("../server.js"); // Link to your server file
const request = require("supertest");
const config = require('../config.js');

var refreshToken;
var email = config.API_TEST_EMAIL
var password = "testPassword";
var emailBad = "wrongEmail";
var tokenBad = "wrongToken";

describe("POST Requests", ()  => {

  test("USER REGISTER: should respond with 200 status code, JSON content-type, access Token and refresh Token have to be defined", async () => {
    const response = await request(app).post("/api/register").send({
      email: email,
      password: password
    })
    refreshToken = response.body.refreshToken;
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  })

  test("USER LOGIN: should respond with 200 status code, JSON content-type, access Token and refresh Token have to be defined", async () => {
    const response = await request(app).post("/api/login").send({
      email: email,
      password: password
    })
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
  })

  test("USER REFRESHTOKEN: should respond with 200 status code, JSON content-type and the correct refresh Token", async () => {
    const response = await request(app).post("/api/token").send({
      token: refreshToken
    })
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.accessToken).toBeDefined();
  })
})

describe("DELETE Requests", () => {
  test("USER LOGOUT: should respond with 200 status code and JSON content-type and a logout message", async () => {
    const response = await request(app).delete("/api/logout").send({
      token: refreshToken
    })
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.msg).toBe("logout");
  })
  test("DELETE USER: should respond with 200 status code and JSON content-type and a delete message", async () => {
    const response = await request(app).delete("/api/deleteuser").send({
      email: email
    })
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.msg).toBe("User deleted");
  })
})

describe("BAD POST Requests", ()  => {

  test("USER BAD REGISTER: should respond with 400 status code, JSON content-type and a error message", async () => {
    const response = await request(app).post("/api/register").send({
      email: emailBad,
      password: password
    })
    refreshToken = response.body.refreshToken;
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.errMsg).toBe("Sie müssen sich erst als Bürger im Bürgeramt melden!");
  })

  test("USER BAD LOGIN: should respond with 400 status code, JSON content-type and a error message", async () => {
    const response = await request(app).post("/api/login").send({
      email: emailBad,
      password: password
    })
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.errMsg).toBe("Ungültige Email oder Passwort.");
  })

  test("USER BAD REFRESHTOKEN: should respond with 403 status code, JSON content-type and a error message", async () => {
    const response = await request(app).post("/api/token").send({
      token: tokenBad
    })
    expect(response.statusCode).toBe(403);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.errMsg).toBe("Ungültiger Token.");
  })
})

describe("BAD DELETE Requests", () => {
  test("USER BAD LOGOUT: should respond with 500 status code and JSON content-type and a error message", async () => {
    const response = await request(app).delete("/api/logout").send({
      token: tokenBad
    })
    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body.errMsg).toBe("Unerwarteter Server Error!");
  })
})