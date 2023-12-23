import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app";

const user = {
  name: "Léo",
  email: "leo@gmail.com",
  password: "123",
};

describe("auth routes", () => {
  it("should be able to register a user", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .set("Content-Type", "application/json")
      .send(user)
      .expect(201);
  });

  it("should be able to sign in with a user's credentials", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .set("Content-Type", "application/json")
      .send(user);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .set("Content-Type", "application/json")
      .send({
        email: user.email,
        password: user.password,
      });

    expect(signInResponse.statusCode).toEqual(200);
    expect(signInResponse.get("set-cookie")).toEqual([
      expect.stringContaining("sessionId"),
    ]);
    expect(signInResponse.body).toEqual({
      user: expect.objectContaining({
        name: user.name,
        email: user.email,
        sessionId: expect.any(String),
      }),
    });
  });

  it("should be able to sign out with user session id", async () => {
    await request(app.server)
      .post("/auth/sign-up")
      .set("Content-Type", "application/json")
      .send(user);

    const signInResponse = await request(app.server)
      .post("/auth/sign-in")
      .set("Content-Type", "application/json")
      .send({
        email: user.email,
        password: user.password,
      });
    const signInCookies = signInResponse.get("set-cookie");

    const signOutResponse = await request(app.server)
      .post("/auth/sign-out")
      .set("Cookie", signInCookies);
    const signOutCookies = signOutResponse.get("set-cookie");

    expect(signOutResponse.statusCode).toEqual(204);
    expect(signOutCookies).toEqual([expect.stringContaining("sessionId=;")]);
  });
});
