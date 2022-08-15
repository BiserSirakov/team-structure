import app from '../../src/app';
import request from 'supertest';

describe('POST /members', () => {
  it('should return validation error if a name is not provided', async () => {
    const res = await request(app).post('/api/members').send({ email: 'john.doe@payhawk.com' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ name: ['The name field is required.'] });
  });

  it('should return validation error if an email is not provided', async () => {
    const res = await request(app).post('/api/members').send({ name: 'John Doe' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ email: ['The email field is required.'] });
  });
});
