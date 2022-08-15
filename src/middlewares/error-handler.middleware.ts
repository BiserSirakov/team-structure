import { Request, Response, NextFunction } from 'express';
import { MemberNotFoundError } from '../services/member.service';

/**
 * Custom error handler to standardize error objects returned to the client
 * @param err Error caught by Express
 * @param req Incoming request
 * @param res Response
 * @param next Next function
 */
export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof MemberNotFoundError) {
    return res.status(404).send(err.message);
  } else {
    console.error(err);
    return res.status(500).send(`Unexpected error: '${err.message}'`);
  }
}
