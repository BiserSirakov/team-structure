import { Express } from 'express';

import validateMember from './middlewares/validate-member.middleware';
import errorHandler from './middlewares/error-handler.middleware';

import {
  createMemberHandler,
  updateMemberHandler,
  deleteMemberHandler,
  getMembersHandler,
} from './controllers/members.controller';

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

  // Not part of the assignment, used as a helper to display the current team structure. (outputs the root)
  app.get('/api/members', getMembersHandler);

  // Custom error handler (should be registered at the end)
  app.use(errorHandler);
}
