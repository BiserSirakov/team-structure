import request from 'supertest';
import app from '../../src/app';
import { getMember, getRoot } from '../../src/services/member.service';

import { createMember } from './create.member.test';

describe('DELETE /api/members/{memberId}', () => {
  it('should successfully delete the root', async () => {
    let rootId = getRoot()?.id;
    if (!rootId) {
      const res1 = await createMember('Pay Root', 'pay.root@payhawk.com');
      rootId = res1.body.id;
    }

    const res = await request(app).delete(`/api/members/${rootId}`);
    expect(res.statusCode).toEqual(204);

    const root = getRoot();
    expect(root).toBeNull();
  });

  /**
   * Delete Two. The employees are now transfered to One. (its manager)
   *
   *       1            1
   *      / \          /|\
   *     2   3   =>   4 5 3
   *    / \
   *   4   5
   */
  it('should successfully delete a member and transfer its employees to its manager', async () => {
    const res1 = await createMember('Pay One', 'pay.1@payhawk.com');

    const res2 = await createMember('Pay Two', 'pay.2@payhawk.com', res1.body.id);
    const res3 = await createMember('Pay Three', 'pay.3@payhawk.com', res1.body.id);

    const res4 = await createMember('Pay Four', 'pay.4@payhawk.com', res2.body.id);
    const res5 = await createMember('Pay Five', 'pay.5@payhawk.com', res2.body.id);

    const res = await request(app).delete(`/api/members/${res2.body.id}`);
    expect(res.statusCode).toEqual(204);

    // check that Four's manager is now One
    const four = getMember(res4.body.id);
    expect(four.manager?.id).toEqual(res1.body.id);

    // check that Five's manager is now One
    const five = getMember(res5.body.id);
    expect(five.manager?.id).toEqual(res1.body.id);

    // check that One has now 3 employees (and those are Four, Five, and Three)
    const one = five.manager;
    expect(one?.employees.size).toEqual(3);
    expect(one?.employees.has(four)).toBe(true);
    expect(one?.employees.has(five)).toBe(true);

    const three = getMember(res3.body.id);
    expect(one?.employees.has(three)).toBe(true);
  });

  it('should successfully delete a member and its email can be used again to create a new member', async () => {
    const res1 = await createMember('John Doe VII', 'john.vii@payhawk.com');

    const res2 = await request(app).delete(`/api/members/${res1.body.id}`);
    expect(res2.statusCode).toEqual(204);

    await createMember('John Doe the VII', 'john.vii@payhawk.com'); // create and assert a member with the same email is successfully created
  });

  it('should return 404 (Not Found) when trying to delete a member that does not exist', async () => {
    const res = await request(app).delete(`/api/members/non-existing-memberId`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "No member found with id 'non-existing-memberId'!" });
  });
});
