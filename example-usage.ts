// Example usage of the updated responseFormatter with intelligent auto-sending

import { sendSuccess, sendError, send } from './src/responseFormatter';
import { Response } from 'express';

// Example 1: Basic error usage
function basicError(res: Response) {
  sendError(res, "Something went wrong", 400);
  // Response format: { "status": "error", "success": false, "message": "Something went wrong" }
}

// Example 2: Success with chaining (send() needed)
function successWithChaining(res: Response) {
  // Chain native Express methods, then send manually
  sendSuccess(res, { userId: 123 }, "Login successful", 200)
    .cookie("authToken", "xyz789", { httpOnly: true })
    .header("X-Custom-Header", "some-value");
  
  // Send the prepared response
  send(res);
}

// Example 3: Simple success response (auto-sends - no send() needed)
function simpleSuccess(res: Response) {
  sendSuccess(res, { data: "test" }, "Success");
  // Auto-sends immediately - no send() required!
}

// Example 4: Error with additional data
function errorWithData(res: Response) {
  sendError(res, "Validation failed", 400, { 
    errors: ["Email is required", "Password too short"] 
  });
}

// Example 5: Complex chaining scenario
function complexChaining(res: Response) {
  sendSuccess(res, { 
    user: { id: 123, name: "John" },
    token: "abc123xyz"
  }, "Authentication successful", 201)
    .cookie("session", "session-abc123", { 
      httpOnly: true, 
      secure: true, 
      maxAge: 3600000 
    })
    .header("X-Rate-Limit-Remaining", "99")
    .header("X-Response-Time", "45ms")
    .cookie("refreshToken", "refresh-abc123", {
      httpOnly: true,
      secure: true,
      maxAge: 86400000 // 24 hours
    });
  
  // Send the prepared response
  send(res);
}

// Example 6: Login scenario (your exact use case)
function loginResponse(res: Response, accesstoken: string, refreshToken: string, user: any, HTTP_OPTIONS: any) {
  sendSuccess(res, {
    accesstoken,
    refreshToken,
    user: {
      username: user.username,
      _id: user._id,
    },
  }, "Login Successful", 200)
    .cookie("accessToken", accesstoken, HTTP_OPTIONS)
    .cookie("refreshToken", refreshToken, HTTP_OPTIONS);
  
  // Send the prepared response
  send(res);
}

/*
Response Formats:

Success Response:
{
  "status": "success",
  "success": true,
  "message": "Login successful", 
  "data": { "userId": 123 }
}

Error Response:
{
  "status": "error", 
  "success": false,
  "message": "Something went wrong",
  "data": { "errors": ["Email is required"] }
}

Benefits of Simple Approach:
✅ No magic - explicit and predictable
✅ Native Express chaining - no learning curve
✅ No timing issues - you control when to send
✅ Easy to test and debug
✅ Works with all Express response methods
✅ Clean separation of concerns
✅ Backward compatible with existing code

Usage Pattern:
1. Prepare response with sendSuccess()
2. Chain native Express methods (.cookie, .header, etc.)
3. Send with send() when ready
*/