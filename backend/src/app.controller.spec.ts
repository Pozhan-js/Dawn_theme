import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('api/vue-nest-poc', () => {
    it('should return POC data from Nest', () => {
      const response = appController.getPocData();

      expect(response.source).toBe('NestJS scaffold API');
      expect(response.items).toHaveLength(3);
      expect(response.items[0].title).toBe('Liquid 挂载点');
    });
  });
});
