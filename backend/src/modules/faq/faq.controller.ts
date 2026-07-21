import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FaqService } from './faq.service';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';

@Controller('faqs')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll() {
    return { data: await this.faqService.findAll() };
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  async create(@Body() data: any) {
    return { data: await this.faqService.create(data), message: 'Created FAQ' };
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  async update(@Param('id', ParseBigIntPipe) id: bigint, @Body() data: any) {
    return { data: await this.faqService.update(id, data), message: 'Updated FAQ' };
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  async remove(@Param('id', ParseBigIntPipe) id: bigint) {
    return { data: await this.faqService.remove(id), message: 'Deleted FAQ' };
  }
}
