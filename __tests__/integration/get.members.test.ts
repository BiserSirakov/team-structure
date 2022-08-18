import request from 'supertest';
import app from '../../src/app';
import { getMember } from '../../src/services/member.service';

import { importTeam } from './import.team.test';

// TODO:
describe('GET /api/members', () => {
  it('should return an array of members for a given name (case insensitive)', async () => {
    // const res1 = await importTeam();
    // const res = await request(app).get('/api/team').query({ name: 'hawk' });
    // console.log(res.body);
    // expect(res.body).toHaveLength(9); // check if all members are returned (they all have "Hawk" in their name)
  });

  it('should return an array of members for a given email', async () => {});
  it('should return an array of members for a given managerEmail', async () => {});
  it('should return an array of members for a given employeeEmail', async () => {});
  it('should return an array of members for a given name and managerEmail', async () => {});
  it('should return an array of members for a given email and employeeEmail', async () => {});
  it('should return an empty array of members for a given non existing email', async () => {});
});
