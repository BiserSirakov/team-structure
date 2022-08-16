import request from 'supertest';
import app from '../../src/app';
import { getMember, getRoot } from '../../src/services/member.service';

describe('POST /api/members', () => {
  it('should successfully create a new top manager', async () => {
    let root = getRoot();
    expect(root).toBeUndefined();

    const res = await createMember('Top Manager', 'top.manager@payhawk.com');

    // check that the rop manager's id is equal to the one received in the response.
    root = getRoot();
    expect(root?.id).toEqual(res.body.id);
  });

  it('should successfully create a new employee under the top manager', async () => {
    const res1 = await createMember('John Doe I', 'john.i@payhawk.com');

    const root = getRoot();
    const johnDoe1 = getMember(res1.body.id);

    // check that the top manager has a single employee and that is 'john.i@payhawk.com'
    expect(root?.employees.size).toEqual(1);
    expect(root?.employees.has(johnDoe1)).toBe(true);
    expect(johnDoe1.manager).toBe(root);

    const res2 = await createMember('John Doe II', 'john.ii@payhawk.com');
    const johnDoe2 = getMember(res2.body.id);

    // check that the top manager now has two employees
    expect(root?.employees.size).toEqual(2);
    expect(root?.employees.has(johnDoe2)).toBe(true);
    expect(johnDoe2.manager).toBe(root);
  });

  it('should successfully create a new employee under a given manager', async () => {
    // create a manager under the top manager
    const resManager = await createMember('John Doe III', 'john.iii@payhawk.com');

    const res = await createMember('John Doe IV', 'john.iv@payhawk.com', resManager.body.id); // here we pass the manager's id

    const john3 = getMember(resManager.body.id);
    const john4 = getMember(res.body.id);

    expect(john3.employees.size).toEqual(1);
    expect(john3.employees.has(john4));
    expect(john4.manager).toBe(john3);
  });

  it('should return 404 (Not Found) when a managerId is passed that does not exist', async () => {
    const res = await request(app).post('/api/members').send({
      name: 'John Doe V',
      email: 'john.v@payhawk.com',
      managerId: 'not-existing-manager-id',
    });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ error: "No member found with id 'not-existing-manager-id'!" });
  });

  it('should return a validation error if a name is not provided', async () => {
    const res = await request(app).post('/api/members').send({
      email: 'john.doe@payhawk.com',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ name: ['The name field is required.'] });
  });

  it('should return a validation error if an email is not provided', async () => {
    const res = await request(app).post('/api/members').send({
      name: 'John Doe',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ email: ['The email field is required.'] });
  });

  it('should return a validation error if an invalid email is provided', async () => {
    const res = await request(app).post('/api/members').send({
      name: 'John Doe',
      email: 'john.doe@pa',
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ email: ['The email must be a valid email address.'] });
  });

  it('should return a validation error if an already used email is provided', async () => {
    const res1 = await createMember('John Doe', 'used.email@payhawk.com');

    // try creating a member with the same email
    const res2 = await request(app).post('/api/members').send({
      name: 'John Doe The Great',
      email: 'used.email@payhawk.com',
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toEqual({
      error: "There is already a member with email 'used.email@payhawk.com'!",
    });
  });
});

export async function createMember(name?: string, email?: string, managerId?: string) {
  const input: any = {};
  if (name) input.name = name;
  if (email) input.email = email;
  if (managerId) input.managerId = managerId;

  const response = await request(app).post('/api/members').send(input);

  expect(response.statusCode).toEqual(201);
  expect(response.body).toHaveProperty('id');
  expect(response.body.name).toEqual(name);
  expect(response.body.email).toEqual(email);

  return response;
}
