// Example usage of the updated responseFormatter with callback chaining

import { sendSuccess, sendError } from "./src/responseFormatter";
import { Response } from "express";

// Example 1: Basic error usage
function basicError(res: Response) {
  sendError(res, "Something went wrong", 400);
  // Response format: { "status": "error", "success": false, "message": "Something went wrong" }
}

// Example 2: Success with callback chaining
function successWithCallbacks(
  res: Response,
  accesstoken: string,
  refreshToken: string,
  user: any,
  HTTP_OPTIONS: any,
) {
  // Use callbacks to chain response methods - should solve the timing issue!
  sendSuccess(
    res,
    {
      accesstoken,
      refreshToken,
      user: {
        username: user.username,
        _id: user._id,
      },
    },
    "Login Successful",
    200,
    [
      (res) => res.cookie("accessToken", accesstoken, HTTP_OPTIONS),
      (res) => res.cookie("refreshToken", refreshToken, HTTP_OPTIONS),
    ],
  );
  // Response sent automatically after callbacks execute!
}

// Example 3: Simple success response (no callbacks needed)
function simpleSuccess(res: Response) {
  sendSuccess(res, { data: "test" }, "Success");
  // Response sent immediately!
}

// Example 4: Error with additional data
function errorWithData(res: Response) {
  sendError(res, "Validation failed", 400, {
    errors: ["Email is required", "Password too short"],
  });
}

// Example 5: Complex callback chaining scenario
function complexChaining(res: Response) {
  sendSuccess(
    res,
    {
      user: { id: 123, name: "John" },
      token: "abc123xyz",
    },
    "Authentication successful",
    201,
    [
      (res) =>
        res.cookie("session", "session-abc123", {
          httpOnly: true,
          secure: true,
          maxAge: 3600000,
        }),
      (res) => res.header("X-Rate-Limit-Remaining", "99"),
      (res) => res.header("X-Response-Time", "45ms"),
      (res) =>
        res.cookie("refreshToken", "refresh-abc123", {
          httpOnly: true,
          secure: true,
          maxAge: 86400000, // 24 hours
        }),
    ],
  );
  // All callbacks executed, then response sent!
}

