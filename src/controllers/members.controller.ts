import { Request, Response, NextFunction } from 'express';

export function createMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const newMember = createMember(req.body.name, req.body.email, req.body.managerId);
    return res.status(201).json(mapMemberToOutput(newMember));
  } catch (error) {
    next(error);
  }
}
