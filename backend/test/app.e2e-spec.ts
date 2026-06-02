import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/vue-nest-poc (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/vue-nest-poc')
      .expect(200)
      .expect(({ body }) => {
        expect(body.source).toBe('NestJS scaffold API');
        expect(body.items).toHaveLength(3);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
