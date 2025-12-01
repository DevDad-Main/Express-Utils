import { describe, it, expect, vi } from "vitest";
import { requireAuth } from "../src/authWrapper.ts";
import jwt from "jsonwebtoken";

describe("Auth Wrapper", () => {
  it("should throw an error if authorization header is missing or malformed", () => {
    const middleware = requireAuth({ secret: "secret" });

    const req = {
      headers: { authorization: "" },
    } as any;

    expect(() => middleware(req, {} as any, () => {})).toThrow(
      "Access denied. No token provided.",
    );
  });

  it("should throw an error if the token is expired", () => {
    const middleware = requireAuth({ secret: "secret" });

    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    const req = {
      headers: { authorization: "Bearer expiredtoken" },
    } as any;

    expect(() => middleware(req, {} as any, () => {})).toThrow(
      "Token expired.",
    );
  });

  it("should throw an error if token is invalid", () => {
    const middleware = requireAuth({ secret: "secret" });

    // Mock verify() to throw a JsonWebTokenError
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new jwt.JsonWebTokenError("invalid");
    });

    const req = {
      headers: { authorization: "Bearer whatever" },
    } as any;

    expect(() => middleware(req, {} as any, () => {})).toThrow(
      "Invalid token.",
    );
  });

  it("should throw a generic authentication error for unknown errors", () => {
    const middleware = requireAuth({ secret: "secret" });

    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("weird failure");
    });

    const req = {
      headers: { authorization: "Bearer weird" },
    } as any;

    expect(() => middleware(req, {} as any, () => {})).toThrow(
      "Authentication failed.",
    );
  });
});
