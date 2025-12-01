import { describe, it, expect } from "vitest";
import { AppError } from "../src/AppError.js";

describe("App Error", () => {
  it("should create an error with the correct properties", () => {
    const error = new AppError("Test Error", 400, ["Field Required"]);

    expect(error.message).toBe("Test Error");
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe("fail");
    expect(error.errors).toEqual(["Field Required"]);
  });

  it("should handle undefined errors", () => {
    const error = new AppError("No errors", 404);
    expect(error.errors).toBeUndefined();
  });

  it("should set errors when provided", () => {
    const error = new AppError("Validation failed", 422, ["Email invalid"]);
    expect(error.errors).toEqual(["Email invalid"]);
  });

  it("should extend Error class", () => {
    const error = new AppError("Test", 500);
    expect(error instanceof Error).toBe(true);
    expect(error.stack).toBeDefined();
  });
});
