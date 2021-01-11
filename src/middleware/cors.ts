import { Response, Request, NextFunction } from 'express';

export function corsRules(req: Request, res: Response, next: NextFunction) {
    try{
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, HEAD, DELETE, OPTIONS');
        if (req.method !== 'OPTIONS') {
            next();
        } else {
            res.end();
        }
    } catch (err){
        next(err);
    }
}
