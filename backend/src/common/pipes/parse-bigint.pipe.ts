import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseBigIntPipe implements PipeTransform<string, bigint> {
  transform(value: string): bigint {
    try {
      return BigInt(value);
    } catch (e) {
      throw new BadRequestException(`Validation failed. "${value}" is not a valid BigInt`);
    }
  }
}
