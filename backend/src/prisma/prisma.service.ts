import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

import { encrypt, decrypt } from '../common/utils/encryption.util';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();

    const extendedClient = this.$extends({
      query: {
        user: {
          async create({ model, operation, args, query }) {
            if (args.data?.nationalId) args.data.nationalId = encrypt(args.data.nationalId as string);
            if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async update({ model, operation, args, query }) {
            if (args.data?.nationalId) args.data.nationalId = encrypt(args.data.nationalId as string);
            if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async upsert({ model, operation, args, query }) {
            if (args.create?.nationalId) args.create.nationalId = encrypt(args.create.nationalId as string);
            if (args.create?.passportNo) args.create.passportNo = encrypt(args.create.passportNo as string);
            if (args.update?.nationalId) args.update.nationalId = encrypt(args.update.nationalId as string);
            if (args.update?.passportNo) args.update.passportNo = encrypt(args.update.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async createMany({ model, operation, args, query }) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map(rec => {
                if (rec.nationalId) rec.nationalId = encrypt(rec.nationalId as string);
                if (rec.passportNo) rec.passportNo = encrypt(rec.passportNo as string);
                return rec;
              });
            } else if (args.data) {
              if (args.data.nationalId) args.data.nationalId = encrypt(args.data.nationalId as string);
              if (args.data.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            }
            return query(args);
          },
          async updateMany({ model, operation, args, query }) {
            if (args.data) {
              if (args.data.nationalId) args.data.nationalId = encrypt(args.data.nationalId as string);
              if (args.data.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            }
            return query(args);
          },
          async findUnique({ model, operation, args, query }) {
            return decryptRecord(await query(args));
          },
          async findMany({ model, operation, args, query }) {
            return decryptArrayOrRecord(await query(args));
          },
          async findFirst({ model, operation, args, query }) {
            return decryptRecord(await query(args));
          }
        },
        bookingPassenger: {
          async create({ model, operation, args, query }) {
            if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async update({ model, operation, args, query }) {
            if (args.data?.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async upsert({ model, operation, args, query }) {
            if (args.create?.passportNo) args.create.passportNo = encrypt(args.create.passportNo as string);
            if (args.update?.passportNo) args.update.passportNo = encrypt(args.update.passportNo as string);
            const result = await query(args);
            return decryptRecord(result);
          },
          async createMany({ model, operation, args, query }) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map(rec => {
                if (rec.passportNo) rec.passportNo = encrypt(rec.passportNo as string);
                return rec;
              });
            } else if (args.data) {
              if (args.data.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            }
            return query(args);
          },
          async updateMany({ model, operation, args, query }) {
            if (args.data) {
              if (args.data.passportNo) args.data.passportNo = encrypt(args.data.passportNo as string);
            }
            return query(args);
          },
          async findUnique({ model, operation, args, query }) {
            return decryptRecord(await query(args));
          },
          async findMany({ model, operation, args, query }) {
            return decryptArrayOrRecord(await query(args));
          },
          async findFirst({ model, operation, args, query }) {
            return decryptRecord(await query(args));
          }
        },
        booking: {
          async findUnique({ model, operation, args, query }) { return decryptRecord(await query(args)); },
          async findMany({ model, operation, args, query }) { return decryptArrayOrRecord(await query(args)); },
          async findFirst({ model, operation, args, query }) { return decryptRecord(await query(args)); }
        },
        flight: {
          async findUnique({ model, operation, args, query }) { return decryptRecord(await query(args)); },
          async findMany({ model, operation, args, query }) { return decryptArrayOrRecord(await query(args)); },
          async findFirst({ model, operation, args, query }) { return decryptRecord(await query(args)); }
        },
        tour: {
          async findUnique({ model, operation, args, query }) { return decryptRecord(await query(args)); },
          async findMany({ model, operation, args, query }) { return decryptArrayOrRecord(await query(args)); },
          async findFirst({ model, operation, args, query }) { return decryptRecord(await query(args)); }
        }
      }
    });
    
    const decryptRecord = (record: any) => {
      if (!record) return record;
      if (record.nationalId) record.nationalId = decrypt(record.nationalId);
      if (record.passportNo) record.passportNo = decrypt(record.passportNo);
      // Decrypt nested relations if they were eagerly loaded
      if (record.passengers && Array.isArray(record.passengers)) {
        record.passengers.forEach(decryptRecord);
      }
      if (record.user) {
        decryptRecord(record.user);
      }
      return record;
    };

    const decryptArrayOrRecord = (result: any) => {
      if (Array.isArray(result)) {
        result.forEach(decryptRecord);
      } else {
        decryptRecord(result);
      }
      return result;
    };

    (extendedClient as any).onModuleInit = this.onModuleInit.bind(this);
    (extendedClient as any).onModuleDestroy = this.onModuleDestroy.bind(this);

    return extendedClient as any;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
