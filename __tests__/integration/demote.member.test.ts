import request from 'supertest';
import app from '../../src/app';
import { find, getMember, getRoot } from '../../src/services/member.service';
import { importTeam } from './import.team.test';

describe('PUT /api/members/{memberId}/demote', () => {
  /**
   * Demote One to be under Eight. One's ex-employees are now transfered to Zero. (One's ex-manager) and One is moved under Eight.
   *
   *        0              0
   *       / \           /| |\
   *      1   2         3 4 5 2
   *    / | \  \   =>    /\    \
   *   3  4  5  8       6  7    8
   *     / \                   /
   *    6   7                 1
   */
  it('should successfully demote a manager', async () => {
    await importTeam();

    // __tests__/files/correct.team.json
    const one = find((m) => m.email === 'hawk.1@payhawk.com');
    expect(one).not.toBeNull();

    const eight = find((m) => m.email === 'hawk.8@payhawk.com');
    expect(eight).not.toBeNull();

    const res = await request(app)
      .put(`/api/members/${one!.id}/demote`)
      .send({ managerId: eight!.id });

    expect(res.statusCode).toEqual(200);

    const updatedOne = getMember(one!.id);

    // check that One's manager is now Eight
    const managerEight = updatedOne.manager;
    expect(managerEight?.id).toEqual(eight!.id);

    expect(managerEight?.employees.size).toEqual(1);
    expect(managerEight?.employees.has(updatedOne)).toBe(true);

    // check that One has no employees anymore
    expect(updatedOne.employees.size).toEqual(0);

    // check that One's ex-employees are now under Zero
    const three = find((m) => m.email === 'hawk.3@payhawk.com');
    expect(three).not.toBeNull();

    const four = find((m) => m.email === 'hawk.4@payhawk.com');
    expect(four).not.toBeNull();

    const five = find((m) => m.email === 'hawk.5@payhawk.com');
    expect(five).not.toBeNull();

    const root = getRoot(); // The root is Zero

    expect(root?.employees.size).toEqual(4);
    expect(root?.employees.has(three!)).toBe(true);
    expect(root?.employees.has(four!)).toBe(true);
    expect(root?.employees.has(five!)).toBe(true);
  });

  // TODO:
  it('should return 404 (Not Found) when trying to demote a member that does not exist', async () => {});
  it('should return 404 (Not Found) when trying to demote a member under a manager that does not exist', async () => {});
});
