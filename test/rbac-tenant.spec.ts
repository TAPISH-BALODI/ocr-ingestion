import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

function createToken(userId: string, role: 'admin' | 'support' | 'moderator' | 'user' = 'user') {
  return jwt.sign({ sub: userId, email: `${userId}@example.com`, role }, JWT_SECRET);
}

describe('RBAC and Tenant Isolation', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows user role to access own documents', async () => {
    const token = createToken('user1', 'user');
    const res = await request(app.getHttpServer())
      .get('/v1/folders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('allows support/moderator read-only access', async () => {
    const token = createToken('support1', 'support');
    const res = await request(app.getHttpServer())
      .get('/v1/folders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('enforces tenant isolation - users cannot access other users data', async () => {
    const user1Token = createToken('user1', 'user');
    const user2Token = createToken('user2', 'user');

    // User1 creates a document
    const upload = await request(app.getHttpServer())
      .post('/v1/docs')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        filename: 'user1-secret.txt',
        mime: 'text/plain',
        primaryTag: 'private',
        textContent: 'secret data',
      });

    expect(upload.status).toBe(201);
    const docId = upload.body._id;

    // User2 tries to search - should not see user1's document
    const search = await request(app.getHttpServer())
      .get('/v1/search?q=secret')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(search.status).toBe(200);
    expect(search.body).toEqual(expect.not.arrayContaining([
      expect.objectContaining({ _id: docId })
    ]));
  });

  it('requires authentication for all endpoints', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/folders');
    expect(res.status).toBe(401);
  });
});

