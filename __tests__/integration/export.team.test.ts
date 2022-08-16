import request from 'supertest';
import app from '../../src/app';
import { getRoot } from '../../src/services/member.service';
import { importTeam } from './import.team.test';

describe('GET /api/team', () => {
  it('should return a JSON with the team structure', async () => {
    const res1 = await importTeam();
    const rootId = res1.body.id; // this is the newly created root (top manager)

    const res2 = await request(app).get(`/api/team`);
    expect(res2.body.id).toEqual(rootId);
  });
});
