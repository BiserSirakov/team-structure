import request from 'supertest';
import app from '../../src/app';
import { getMember } from '../../src/services/member.service';

import { createMember } from './create.member.test';

describe('PUT /members', () => {
  /**
   * Update Two' manager to be Three.
   *
   *       1             1
   *      / \             \
   *     2   3   =>        3
   *    / \                 \
   *   4   5                 2
   *                        / \
   *                       4   5
   */
  it("should successfully update a member's manager", async () => {
    const res1 = await createMember('Hawk One', 'hawk.1@payhawk.com');

    const res2 = await createMember('Hawk Two', 'hawk.2@payhawk.com', res1.body.id);
    const res3 = await createMember('Hawk Three', 'hawk.3@payhawk.com', res1.body.id);

    const res4 = await createMember('Hawk Four', 'hawk.4@payhawk.com', res2.body.id);
    const res5 = await createMember('Hawk Five', 'hawk.5@payhawk.com', res2.body.id);

    const res = await request(app).put(`/api/members/${res2.body.id}`).send({
      managerId: res3.body.id,
    });

    expect(res.statusCode).toEqual(200);

    // check that Two's manager is now Three
    const two = getMember(res2.body.id);
    expect(two.manager?.id).toEqual(res3.body.id);

    const three = two.manager;

    // check that One has only one employee left (and that is Three)
    const one = three?.manager;
    expect(one?.employees.size).toEqual(1);
    expect(one?.employees.has(three!)).toBe(true);

    // check that Three has now one employee (and that is Two)
    expect(three?.employees.size).toEqual(1);
    expect(three?.employees.has(two));

    // check that Two still has the 2 employees
    expect(two.employees.size).toEqual(2);

    const four = getMember(res4.body.id);
    const five = getMember(res5.body.id);

    expect(two.employees.has(four)).toBe(true);
    expect(two.employees.has(five)).toBe(true);
  });

  it('should return 404 (Not Found) when trying to update a member that does not exist', async () => {
    const res = await request(app).put(`/api/members/non-existing-memberId`).send({
      managerId: 'irrelevant',
    });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "No member found with id 'non-existing-memberId'!" });
  });

  it('should return 404 (Not Found) when a managerId is passed that does not exist', async () => {
    // create a member
    const res1 = await createMember('John Doe VI', 'john.vi@payhawk.com');

    const res2 = await request(app).put(`/api/members/${res1.body.id}`).send({
      managerId: 'non-existing-managerId',
    });

    expect(res2.statusCode).toEqual(404);
    expect(res2.body).toEqual({ error: "No member found with id 'non-existing-managerId'!" });
  });
});
