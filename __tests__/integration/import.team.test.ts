import request from 'supertest';
import app from '../../src/app';
import { getRoot } from '../../src/services/member.service';
import { createMember } from './create.member.test';

describe('POST /api/team', () => {
  it('should successfully create a team by uploading a JSON file', async () => {
    await importTeam();
  });

  it('should successfully replace a team by uploading a JSON file', async () => {
    await importTeam();

    let root = getRoot();
    expect(root?.employees.size).toEqual(2);

    // add a member under the root
    const res1 = await createMember('John Doe', 'john.doe@payhawk.com');

    root = getRoot();
    expect(root?.employees.size).toEqual(3);

    await importTeam();

    // the team is overridden
    root = getRoot();
    expect(root?.employees.size).toEqual(2);
  });

  // TODO: this throws read ECONNRESET
  // it('should return a validation error when uploading a file with type that is not JSON', async () => {
  //   const response = await request(app)
  //     .post('/api/team')
  //     .attach('team', '__tests__/files/text.txt');

  //   expect(response.statusCode).toEqual(500);
  //   expect(response.body).toEqual("Unexpected error: 'Only .json allowed!'");
  // });

  it('should return a validation error when uploading an invalid JSON file', async () => {
    const res = await importIncorrectTeam('invalid.json');
    expect(res.body).toEqual({ error: 'Invalid JSON!' });
  });

  it('should return a validation error when uploading a JSON file with incorrect data: duplicate emails', async () => {
    const res = await importIncorrectTeam('incorrect.team_duplicate.emails.json');
    expect(res.body).toEqual({
      messagee: 'Incorrect team structure!',
      errors: {
        email: ['There are duplicate emails.'],
      },
    });
  });

  it('should return a validation error when uploading a JSON file with incorrect data: invalid email', async () => {
    const res = await importIncorrectTeam('incorrect.team_invalid.email.json');
    expect(res.body).toEqual({
      messagee: 'Incorrect team structure!',
      errors: {
        email: ['The email must be a valid email address.'],
      },
    });
  });

  it('should return a validation error when uploading a JSON file with incorrect data: missing email', async () => {
    const res = await importIncorrectTeam('incorrect.team_missing.email.json');
    expect(res.body).toEqual({
      messagee: 'Incorrect team structure!',
      errors: {
        email: ['The email field is required.'],
      },
    });
  });

  it('should return a validation error when uploading a JSON file with incorrect data: missing name', async () => {
    const res = await importIncorrectTeam('incorrect.team_missing.name.json');
    expect(res.body).toEqual({
      messagee: 'Incorrect team structure!',
      errors: {
        name: ['The name field is required.'],
      },
    });
  });
});

export async function importTeam() {
  const response = await request(app)
    .post('/api/team')
    .attach('team', `__tests__/files/correct.team.json`);

  expect(response.statusCode).toEqual(200);

  const root = getRoot();
  expect(root?.id).toEqual(response.body.id);

  return response;
}

export async function importIncorrectTeam(filename: string = 'correct.team.json') {
  const response = await request(app)
    .post('/api/team')
    .attach('team', `__tests__/files/${filename}`);

  expect(response.statusCode).toEqual(400);

  return response;
}
