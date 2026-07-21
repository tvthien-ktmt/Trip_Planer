import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/contact')
  async submitContact(@Body() dto: any) {
    // In a real app, save to DB or send email here.
    return { success: true, message: 'Message received' };
  }
}
