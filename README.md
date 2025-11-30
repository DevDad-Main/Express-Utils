# Express Utils

A collection of reusable utilities for Express.js applications, including error handling, async route wrapping, and custom error classes.

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
