import { Request, Response, NextFunction } from 'express';
import { MemberOutput } from '../models/member.output.model';
import {
  mapMemberToOutput,
  mapOutputToMember,
  IncorrectTeamStructureError,
} from '../services/member.mapper.service';
import { setRoot, checkEmails, getRoot, rebalanceTeam } from '../services/member.service';

export function importTeamHandler(req: Request, res: Response) {
  const bufStr = req.file?.buffer?.toString();
  if (!bufStr) {
    return res.status(400).json({ error: 'The file is empty!' });
  }

  try {
    const imported: MemberOutput = JSON.parse(bufStr);

    const importedRoot = mapOutputToMember(imported);

    if (!checkEmails(importedRoot)) {
      throw new IncorrectTeamStructureError({ email: ['There are duplicate emails.'] });
    }

    // TODO: set the used emails from the import to the tree's emails set

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

export function exportTeamHandler(req: Request, res: Response) {
  const root = getRoot();
  const output = root ? mapMemberToOutput(root) : {};

  return res
    .setHeader('Content-disposition', 'attachment; filename=team-structure.json')
    .json(output);
}

export function rebalanceTeamHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const rebalancedTeam = rebalanceTeam(req.body.balanceIndex);
    return res.json(mapMemberToOutput(rebalancedTeam));
  } catch (error) {
    next(error);
  }
}
