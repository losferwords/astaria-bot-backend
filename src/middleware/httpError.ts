import { Response, Request, NextFunction } from "express";
import httpError from 'http-errors';

export function httpErrorHandler(req: Request, res: Response, next: NextFunction) {
    const error = httpError(404, 'Not Found');
    next(error);
}