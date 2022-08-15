import { Request, Response, NextFunction } from 'express';

import { createMember, deleteMember, getRoot, updateManager } from '../services/member.service';
import { mapMemberToOutput } from '../services/member.mapper.service';

export function createMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const newMember = createMember(req.body.name, req.body.email, req.body.managerId);
    return res.status(201).json(mapMemberToOutput(newMember));
  } catch (error) {
    next(error);
  }
}

export function getMembersHandler(req: Request, res: Response) {
  const root = getRoot();
  if (!root) {
    return res.status(404).send('There are no members in the current team structure.');
  }

  return res.json(mapMemberToOutput(root));
}

export function updateMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const updatedMember = updateManager(req.params.memberId, req.body.managerId);
    return res.json(mapMemberToOutput(updatedMember));
  } catch (error) {
    next(error);
  }
}

export function deleteMemberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    deleteMember(req.params.memberId);
    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}
