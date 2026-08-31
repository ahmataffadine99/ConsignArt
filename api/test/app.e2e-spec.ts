import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Artworks Endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1'); // Le même préfixe que dans main.ts
    await app.init();
  });

  it('/api/v1/artworks (GET) devrait retourner un tableau (Endpoint complet)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/artworks')
      .expect(200)
      .expect((res) => {
        // Le TransformInterceptor renvoie la réponse sous forme { data, meta, timestamp }
        const responseBody = res.body;
        expect(responseBody).toHaveProperty('data');
        expect(Array.isArray(responseBody.data)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
