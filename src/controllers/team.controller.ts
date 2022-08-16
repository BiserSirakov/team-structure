import { Request, Response, NextFunction, json } from 'express';
import { MemberOutput } from '../models/member.output.model';
import {
  mapMemberToOutput,
  mapOutputToMember,
  IncorrectTeamStructureError,
} from '../services/member.mapper.service';
import { setRoot } from '../services/member.service';

export function importTeamHandler(req: Request, res: Response, next: NextFunction) {
  const bufStr = req.file?.buffer?.toString();
  if (!bufStr) {
    return res.status(400).json({ error: 'The file is empty!' }); // TODO:
  }

  try {
    const imported: MemberOutput = JSON.parse(bufStr);

    const importedRoot = mapOutputToMember(imported);
    setRoot(importedRoot);

    return res.json(mapMemberToOutput(importedRoot));
  } catch (error) {
    if (error instanceof IncorrectTeamStructureError) {
      return res.status(400).json({ messagee: error.message, errors: error.errors });
    } else if (error instanceof SyntaxError) {
      return res.status(400).json({ error: 'Invalid JSON!' });
    } else {
      console.error(error);
      return res.status(500).send(`Unexpected error: '${error}'`);
    }
  }
}

export function exportTeamHandler(req: Request, res: Response, next: NextFunction) {}
