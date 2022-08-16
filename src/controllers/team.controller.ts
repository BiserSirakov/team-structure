import { Request, Response, NextFunction, json } from 'express';
import { MemberOutput } from '../models/member.output.model';
import { mapOutputToMember, mapMemberToOutput } from '../services/member.mapper.service';
import { setRoot } from '../services/member.service';

export function importTeamHandler(req: Request, res: Response, next: NextFunction) {
  const buf = req.file?.buffer;
  if (!buf) {
    return res.status(400).json({ error: '' });
  }

  const input: MemberOutput = JSON.parse(buf.toString());

  // TODO: validate input

  // map to a member (the new root)
  const importedRoot = mapOutputToMember(input);

  // set as a new root
  setRoot(importedRoot);

  return res.json(mapMemberToOutput(importedRoot));
}

export function exportTeamHandler(req: Request, res: Response, next: NextFunction) {}
