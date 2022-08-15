import request from 'supertest';

import app from '../../src/app';

import { getRoot } from '../../src/services/member.service';

describe('POST /members', () => {
  it('should successfully create a new top manager', async () => {
    let root = getRoot();
    expect(root).toBeUndefined();

    const res = await request(app).post('/api/members').send({
      name: 'Top Manager',
      email: 'top.manager@payhawk.com',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Top Manager');
    expect(res.body.email).toEqual('top.manager@payhawk.com');

    // check that the rop manager's id is equal to the one received in the response.
    root = getRoot();
    expect(root?.id).toEqual(res.body.id);
  });

  it('should successfully create a new employee under the top manager', async () => {
    const res = await request(app).post('/api/members').send({
      name: 'John Doe I',
      email: 'john.i@payhawk.com', // no managerId is passed here
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('John Doe I');
    expect(res.body.email).toEqual('john.i@payhawk.com');

    const root = getRoot();
    const employees = root?.findEmployees((e) => e.email === 'john.i@payhawk.com');

    // check that the top manager has a single employee with the given email and its id is === the one in the response
    expect(employees?.length).toEqual(1);
    expect(employees![0].id).toEqual(res.body.id);
  });

  it('should successfully create a new employee under a given manager', async () => {

    const root = getRoot();
    const johndoe1 =

    const res = await request(app).post('/api/members').send({
      name: 'John Doe I',
      email: 'john.i@payhawk.com', // no managerId is passed here
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('John Doe I');
    expect(res.body.email).toEqual('john.i@payhawk.com');

    const employees = root?.findEmployees((e) => e.email === 'john.i@payhawk.com');

    // check that the top manager has a single employee with the given email and its id is === the one in the response
    expect(employees?.length).toEqual(1);
    expect(employees![0].id).toEqual(res.body.id);
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
    const res1 = await request(app).post('/api/members').send({
      name: 'John Doe',
      email: 'used.email@payhawk.com',
    });

    expect(res1.statusCode).toEqual(201);

    // try creating a member with the same email
    const res2 = await request(app).post('/api/members').send({
      name: 'John Doe II',
      email: 'used.email@payhawk.com',
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body).toEqual({
      error: "There is already a member with email 'used.email@payhawk.com'!",
    });
  });
});
