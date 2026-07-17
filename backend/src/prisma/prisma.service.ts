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

    // DB-030 fix: Encrypt PII at application layer
    this.$use(async (params, next) => {
      const isUserOrPassenger = params.model === 'User' || params.model === 'BookingPassenger';
      
      // Encrypt on write
      if (isUserOrPassenger && (params.action === 'create' || params.action === 'update' || params.action === 'upsert')) {
        if (params.args.data?.nationalId) {
          params.args.data.nationalId = encrypt(params.args.data.nationalId);
        }
        if (params.args.data?.passportNo) {
          params.args.data.passportNo = encrypt(params.args.data.passportNo);
        }
        if (params.args.create?.nationalId) {
          params.args.create.nationalId = encrypt(params.args.create.nationalId);
        }
        if (params.args.create?.passportNo) {
          params.args.create.passportNo = encrypt(params.args.create.passportNo);
        }
        if (params.args.update?.nationalId) {
          params.args.update.nationalId = encrypt(params.args.update.nationalId as string);
        }
        if (params.args.update?.passportNo) {
          params.args.update.passportNo = encrypt(params.args.update.passportNo as string);
        }
      }

      const result = await next(params);

      // Decrypt on read
      const decryptRecord = (record: any) => {
        if (!record) return;
        if (record.nationalId) record.nationalId = decrypt(record.nationalId);
        if (record.passportNo) record.passportNo = decrypt(record.passportNo);
        // Decrypt nested relations if they were eagerly loaded
        if (record.passengers && Array.isArray(record.passengers)) {
          record.passengers.forEach(decryptRecord);
        }
        if (record.user) {
          decryptRecord(record.user);
        }
      };

      if (isUserOrPassenger || params.model === 'Booking' || params.model === 'Flight' || params.model === 'Tour') {
        if (Array.isArray(result)) {
          result.forEach(decryptRecord);
        } else {
          decryptRecord(result);
        }
      }

      return result;
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
