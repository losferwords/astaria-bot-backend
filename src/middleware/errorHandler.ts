import { Response, Request, NextFunction } from "express";
import log4js from 'log4js';

const logger = log4js.getLogger('middleware/errorHandler');
logger.level = 'debug';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.status || err.statusCode) {
        logger.warn('HTTP Error:', (err.status ? err.status : err.statusCode) + ' ' + err.message + ', url: ' + req.url);
    } else {
        logger.error('Unexpected error:', err);
    }

    res.status(err.status || err.statusCode || 500);
    res.json({
        error: {
            message: err.message
        }
    });
}