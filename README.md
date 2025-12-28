# Express Utils

A collection of reusable utilities for Express.js applications, including error handling, async route wrapping, custom error classes, MongoDB connection management, and Winston-based logging.

## Installation

```bash
npm install devdad-express-utils
# or
yarn add devdad-express-utils
# or
pnpm add devdad-express-utils
```

## Usage

### Error Handling

```typescript
import express from "express";
import { errorHandler, AppError } from "devdad-express-utils";

const app = express();

// Your routes here

// Use the error handler as the last middleware
app.use(errorHandler);

// In your controllers, throw AppError for operational errors
throw new AppError("Something went wrong", 400);
```

### Async Route Wrapping

```typescript
import { catchAsync } from "devdad-express-utils";

const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.json(users);
});

app.get("/users", getUsers);
```

### Custom Error Class

```typescript
import { AppError } from "devdad-express-utils";

throw new AppError("Validation failed", 400, ["Email is required"]);
```

### Response Formatting

Standardize API responses with consistent JSON structure and automatic response sending.

```typescript
import { sendSuccess, sendError } from "devdad-express-utils";

// Success response
sendSuccess(res, { id: 1, name: "John" }, "User fetched", 200);

// Chain additional response methods
sendSuccess(res, { id: 1, name: "John" })
  .cookie("session", "abc123")
  .setHeader("X-Custom", "value");
// Response sent automatically! 🎉

// Error response
sendError(res, "User not found", 404);
```

#### Response Format

All responses include a `success` field by default:

**Success Response:**

```json
{
  "status": "success",
  "success": true,
  "message": "User fetched",
  "data": { "id": 1, "name": "John" }
}
```

**Error Response:**

```json
{
  "status": "error",
  "success": false,
  "message": "User not found"
}
```

#### Method Chaining

`sendSuccess` returns the Express response object, allowing you to chain any Express response methods:

```typescript
sendSuccess(res, { token: "abc123" }, "Login successful", 200)
  .cookie("authToken", "abc123", { httpOnly: true, secure: true })
  .header("X-Rate-Limit-Remaining", "99")
  .status(200); // Can even override status
// Response automatically sent after chaining completes
```

### Database Connection

MongoDB connection utility with automatic reconnection, exponential backoff, and configurable retry logic.

```typescript
import {
  connectDB,
  getDBStatus,
  resetDBConnection,
} from "devdad-express-utils";

// Connect to MongoDB (ensure MONGO_URI is set in environment)
await connectDB();

// Check connection status
const status = getDBStatus();
console.log(status); // { isConnected: true, readyState: 1, host: '...', name: '...', retryCount: 0 }

// Manually reset and retry (useful after Docker container restarts)
await resetDBConnection();
```

#### Environment Variables

- **MONGO_URI**: MongoDB connection string (required)
- **DB_MAX_RETRIES**: Maximum connection retry attempts (default: 10)
- **DB_RETRY_INTERVAL**: Initial retry interval in milliseconds (default: 3000)
- **NODE_ENV**: Set to 'production' to exit after max retries, 'development' to keep process alive

#### Retry Behavior

- **Exponential backoff**: Retry intervals increase exponentially (3s → 6s → 12s → 24s → 30s max)
- **Random jitter**: Adds up to 1 second of random delay to prevent thundering herd
- **Docker-friendly**: Higher default retry count (10) accommodates container startup times
- **Development mode**: Process stays alive after max retries for manual recovery
- **Production mode**: Process exits after max retries to allow container restart

### Logging

Winston-based logger with configurable service name and environment-aware transports.

```typescript
import { logger } from "devdad-express-utils";

// Log messages at different levels
logger.info("User logged in", { userId: 123 });
logger.error("Database connection failed", { error: err.message });
logger.debug("Processing request", { requestId: "abc-123" });
```

#### Configuration

- **Service Name**: Set `SERVICE_NAME` environment variable to customize the service name in logs (defaults to "express-utils")
- **Log Level**: "debug" in development, "info" in production
- **Transports**:
  - **Development**: Console (colored) + error.log + combined.log files
  - **Production**: Console only (suitable for platforms like Railway)

#### Log Files

In development, logs are written to:

- `error.log`: Error level and above
- `combined.log`: All log levels

## Error Handling Patterns

### Using AppError

**For operational errors (expected errors like validation):**

```typescript
// In controllers wrapped with catchAsync
const createUser = catchAsync(async (req, res, next) => {
  // Validation fails
  return next(new AppError("Email is required", 400));
});

// Or for unexpected errors
throw new AppError("Database connection failed", 500);
```

**Why `next(new AppError())` over `throw`?**

- `next()` passes the error to your error handler middleware
- Allows centralized error handling and formatting
- Better for Express middleware pattern
- `throw` is more for unexpected errors that bubble up

### Complete Example

```javascript
const express = require("express");
const { AppError, catchAsync, errorHandler } = require("devdad-express-utils");

const app = express();

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  res.json(user);
});

app.get("/users/:id", getUser);

// Error handler should be last
app.use(errorHandler);
```

#### JavaScript Usage

```javascript
const { AppError, catchAsync, errorHandler } = require("devdad-express-utils");

// Or with ES modules
import { AppError, catchAsync, errorHandler } from "devdad-express-utils";
```

## API

### AppError

Custom error class for operational errors.

```typescript
new AppError(message: string, statusCode: number, errors?: string[])
```

### catchAsync

Higher-order function to wrap async route handlers and catch errors.

```typescript
catchAsync(fn: (req, res, next) => Promise<any>) => (req, res, next) => void
```

### errorHandler

Express error handling middleware with detailed logging in development.

```typescript
errorHandler(err: any, req: Request, res: Response, next: NextFunction) => void
```

### sendSuccess

Sends a standardized success response with automatic sending after method chaining. Returns the Response object for chaining Express response methods like `.cookie()`, `.header()`, etc.

```typescript
sendSuccess(res: Response, data: any, message?: string, statusCode?: number) => Response
```

**Features:**

- Includes `success: true` field by default
- Automatically sends response after chaining completes
- Supports all Express response method chaining
- No extra `.send()` call needed

### sendError

Sends a standardized error response immediately.

```typescript
sendError(res: Response, message: string, statusCode?: number, data?: any) => void
```

**Features:**

- Includes `success: false` field by default
- Sends response immediately (no chaining needed for errors)

### connectDB

Connects to MongoDB with retry logic and automatic reconnection.

```typescript
connectDB() => Promise<void>
```

### getDBStatus

Gets the current MongoDB connection status.

```typescript
getDBStatus() => { isConnected: boolean; readyState: number; host: string; name: string; retryCount: number; }
```

### resetDBConnection

Manually resets retry count and attempts reconnection. Useful for recovering from Docker container restarts.

```typescript
resetDBConnection() => Promise<void>
```

### logger

Winston logger instance with JSON formatting, timestamps, and error stack traces.

```typescript
logger: winston.Logger;
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm run build

# Publish to npm
npm publish
```

## License

ISC
