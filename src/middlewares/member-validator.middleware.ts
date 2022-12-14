import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/member.model';
import { isEmailUsed } from '../services/member.service';

/**
 * Validates the incoming request.
 * @param req Incoming request
 * @param res Response
 * @param next Next function in the middleware chain
 * @returns 400 (Bad Request) with error message(s) if the request does not meet the validation rules.
 */
export default function validateMember(req: Request, res: Response, next: NextFunction) {
  const validator = Member.getValidator(req.body.name, req.body.email);
  if (!validator.validate()) {
    return res.status(400).send(validator.errors().all());
  }

  // check if there is already a member with this email
  if (isEmailUsed(req.body.email)) {
    return res
      .status(400)
      .send({ error: `There is already a member with email '${req.body.email}'!` });
  }

  return next();
}
