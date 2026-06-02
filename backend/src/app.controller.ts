import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api/vue-nest-poc')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getPocData() {
    return this.appService.getPocData();
  }
}
