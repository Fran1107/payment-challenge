import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app'; 
import env from '../../src/config/env';

jest.mock('uuid', () => ({
  v4: () => '00000000-0000-4000-8000-000000000000',
}));

jest.setTimeout(60000);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('POST /auth/token', () => {
  it('debería retornar 200 y un access_token con credenciales válidas', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({
        client_id: env.validClientId,
        client_secret: env.validClientSecret,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
    expect(response.body.token_type).toBe('Bearer');
    expect(response.body.expires_in).toBe(env.tokenExpiry);
  });

  it('debería retornar 401 UNAUTHORIZED con credenciales inválidas', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({
        client_id: 'wrong_client',
        client_secret: 'wrong_secret',
      });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('UNAUTHORIZED');
  });

  it('debería retornar 400 VALIDATION_ERROR si faltan datos en el body', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('VALIDATION_ERROR');
  });
});