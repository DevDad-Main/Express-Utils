import type { NextFunction, Request, Response } from "express";

//#region Catch Async Handler
/**
 * Higher-order function to catch asynchronous errors in Express route handlers.
 * @param {(req: Request, res: Response, next: NextFunction) => Promise<any>} fn - The async route handler.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} - The wrapped handler that catches errors.
 */
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
//#endregion
