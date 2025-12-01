import jwt, {
  JwtPayload,
  Algorithm,
  JsonWebTokenError,
  TokenExpiredError,
} from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError.js";

interface AuthOptions {
  secret: string;
  algorithms?: Algorithm[];
}

const defaultAlgorithms: Algorithm[] = ["HS256"];

interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string;
}

/**
 * Middleware to require JWT authentication.
 * Verifies the JWT token from Authorization header and attaches decoded payload to req.user.
 * @param {AuthOptions} options - JWT verification options.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} - Middleware function.
 */
export const requireAuth = (options: AuthOptions) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new AppError("Malformed authorization header.", 401);
    }
    const token = authHeader.substring(7);

    if (!token) {
      throw new AppError("Access denied. No token provided.", 401);
    }

    try {
      let decoded: JwtPayload | string;
      if (options.algorithms) {
        decoded = jwt.verify(token, options.secret, {
          algorithms: options.algorithms,
        });
      } else {
        decoded = jwt.verify(token, options.secret);
      }
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new AppError("Invalid token.", 401);
      } else if (error instanceof TokenExpiredError) {
        throw new AppError("Token expired.", 401);
      } else {
        throw new AppError("Authentication failed.", 401);
      }
    }
  };
};

