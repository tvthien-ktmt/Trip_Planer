import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FaqService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.extended.faq.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  // Basic admin methods
  async create(data: { question: string; answer: string; category?: string; displayOrder?: number }) {
    return this.prisma.extended.faq.create({ data });
  }

  async update(id: bigint, data: { question?: string; answer?: string; category?: string; displayOrder?: number }) {
    return this.prisma.extended.faq.update({ where: { id }, data });
  }

  async remove(id: bigint) {
    return this.prisma.extended.faq.delete({ where: { id } });
  }
}
