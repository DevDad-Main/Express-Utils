import type { NextFunction, Request, Response } from "express";

//#region Catch Async Handler
export const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
//#endregion
