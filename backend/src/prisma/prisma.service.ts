import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../common/utils/encryption.util';

const PII_FIELDS = ['nationalId', 'passportNo', 'phone', 'fullName'];

function encryptPii<T>(data: T, depth = 0): T {
  if (!data || typeof data !== 'object' || depth > 5) return data;
  for (const key of Object.keys(data)) {
    if (PII_FIELDS.includes(key) && typeof data[key] === 'string') {
      data[key] = encrypt(data[key]);
    } else if (typeof data[key] === 'object') {
      if (Array.isArray(data[key as keyof T])) {
        (data[key as keyof T] as any).forEach((r: any) => encryptPii(r, depth + 1));
      } else if (data[key] instanceof Date) {
        // skip
      } else {
        encryptPii(data[key], depth + 1);
      }
    }
  }
  return data;
}

function decryptRecord<T>(record: T, depth = 0): T {
  if (!record || typeof record !== 'object' || depth > 5) return record;
  for (const key of Object.keys(record)) {
    if (PII_FIELDS.includes(key) && typeof record[key] === 'string') {
      try {
        record[key] = decrypt(record[key]);
      } catch (e) {
        // Fallback or ignore if decryption fails
      }
    } else if (typeof record[key] === 'object') {
      if (Array.isArray(record[key as keyof T])) {
        (record[key as keyof T] as any).forEach((r: any) => decryptRecord(r, depth + 1));
      } else if (record[key] instanceof Date) {
        // skip
      } else {
        decryptRecord(record[key], depth + 1);
      }
    }
  }
  return record;
}

export type ExtendedPrismaClient = ReturnType<typeof getExtendedClient>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private _client: PrismaClient;
  public readonly extended: ExtendedPrismaClient;

  constructor() {
    this._client = new PrismaClient();
    this.extended = getExtendedClient(this._client);
  }

  async onModuleInit() {
    await this._client.$connect();
  }

  async onModuleDestroy() {
    await this._client.$disconnect();
  }

  public get $queryRaw() {
    return this._client.$queryRaw.bind(this._client);
  }
}

function getExtendedClient(client: PrismaClient) {
  return client.$extends({
    query: {
        user: {
          async create({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async update({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async upsert({ args, query }) { args.create = encryptPii(args.create); args.update = encryptPii(args.update); return decryptRecord(await query(args)); },
          async createMany({ args, query }) {
            if (Array.isArray(args.data)) args.data = args.data.map(encryptPii);
            else args.data = encryptPii(args.data);
            return query(args);
          },
          async updateMany({ args, query }) { if (args.data) args.data = encryptPii(args.data); return query(args); },
          async findUnique({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findMany({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findFirst({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
        },
        bookingPassenger: {
          async create({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async update({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async upsert({ args, query }) { args.create = encryptPii(args.create); args.update = encryptPii(args.update); return decryptRecord(await query(args)); },
          async createMany({ args, query }) {
            if (Array.isArray(args.data)) args.data = args.data.map(encryptPii);
            else args.data = encryptPii(args.data);
            return query(args);
          },
          async updateMany({ args, query }) { if (args.data) args.data = encryptPii(args.data); return query(args); },
          async findUnique({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findMany({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findFirst({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
        },
        auditLog: {
          async create({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async update({ args, query }) { args.data = encryptPii(args.data); return decryptRecord(await query(args)); },
          async upsert({ args, query }) { args.create = encryptPii(args.create); args.update = encryptPii(args.update); return decryptRecord(await query(args)); },
          async createMany({ args, query }) {
            if (Array.isArray(args.data)) args.data = args.data.map(d => encryptPii(d));
            else args.data = encryptPii(args.data);
            return query(args);
          },
          async updateMany({ args, query }) { if (args.data) args.data = encryptPii(args.data); return query(args); },
          async findUnique({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findMany({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
          async findFirst({ args, query }) { if (args.where) args.where = encryptPii(args.where); return decryptRecord(await query(args)); },
        },
    },
  });
}

