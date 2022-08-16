import { Express } from 'express';

import validateMember from './middlewares/member-validator.middleware';
import errorHandler from './middlewares/error-handler.middleware';
import {
  createMemberHandler,
  updateMemberHandler,
  deleteMemberHandler,
  getMembersHandler,
} from './controllers/members.controller';
import { exportTeamHandler, importTeamHandler } from './controllers/team.controller';

import multer from 'multer';
const upload = multer({ limits: { fileSize: 1 * 1024 * 1024 } }); // limit file size to 1MB
// TODO: add filter for JSON files only?

export default function routes(app: Express) {
  /**
   * Create a member.
   */
  app.post('/api/members', validateMember, createMemberHandler);

  /**
   * Update the member's manager.
   */
  app.put('/api/members/:memberId', updateMemberHandler);

  /**
   * Delete a member.
   */
  app.delete('/api/members/:memberId', deleteMemberHandler);

  /**
   * Get members (as an array) for a given set of filters.
   */
  app.get('/api/members', getMembersHandler);

  /**
   * Import a team (upload a json file)
   */
  app.post('/api/team', upload.single('team'), importTeamHandler);

  /**
   * Gets a team (exports a json file)
   */
  app.get('/api/team', exportTeamHandler);

  // Custom error handler (should be registered at the end)
  app.use(errorHandler);
}
