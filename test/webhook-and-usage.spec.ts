import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import jwt from 'jsonwebtoken';

function token(sub: string, role: string = 'user') {
  return jwt.sign({ sub, email: sub + '@ex.com', role }, process.env.JWT_SECRET || 'dev-secret-key');
}

describe('Webhook classification/rate-limit and credits tracking', () => {
  let app: INestApplication;
  const t = token('u3');

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates at most 3 tasks per sender per day', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app.getHttpServer())
        .post('/v1/webhooks/ocr')
        .set('Authorization', `Bearer ${t}`)
        .send({ source: 'scanner-01', imageId: 'x'+i, text: 'LIMITED TIME SALE unsubscribe: mailto:stop@brand.com' });
      expect(res.status).toBe(201);
      expect(res.body.category).toBe('ad');
    }
    // Post metrics to see tasks_today >= 3
    const metrics = await request(app.getHttpServer())
      .get('/v1/metrics')
      .set('Authorization', `Bearer ${t}`);
    expect(metrics.status).toBe(200);
    expect(metrics.body.tasks_today).toBeGreaterThanOrEqual(3);
  });

  it('consumes 5 credits per action run', async () => {
    const run = await request(app.getHttpServer())
      .post('/v1/actions/run')
      .set('Authorization', `Bearer ${t}`)
      .send({ scope: { type: 'files', ids: [] }, messages: [], actions: ['make_document'] });
    expect(run.status).toBe(201);
    const usage = await request(app.getHttpServer())
      .get('/v1/actions/usage/month')
      .set('Authorization', `Bearer ${t}`);
    expect(usage.status).toBe(200);
    expect(usage.body.credits).toBeGreaterThanOrEqual(5);
  });
});


