import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Vouchers')
@Controller('api/vouchers')
export class VoucherController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('flash-sale')
  @ApiOperation({ summary: 'Get flash sale voucher for frontend' })
  async getFlashSale() {
    const now = new Date();
    const activeVoucher = await this.prisma.extended.voucher.findFirst({
      where: {
        validTo: { gte: now },
        validFrom: { lte: now },
      },
      orderBy: { validTo: 'asc' }, // Get the one ending soonest
    });

    if (!activeVoucher) {
      return { data: null };
    }

    return {
      data: {
        code: activeVoucher.code,
        discountPercent: activeVoucher.discountType === 'PERCENT' ? Number(activeVoucher.discountValue) : null,
        expiresAt: activeVoucher.validTo,
      }
    };
  }

  /**
   * Get vouchers available to or redeemed by the current user.
   * Returns active global vouchers + vouchers redeemed by the user.
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user vouchers (available + redeemed)' })
  async getMyVouchers(@CurrentUser() user: any) {
    const now = new Date();

    // Get vouchers the user has already redeemed
    const redeemedVouchers = await this.prisma.extended.voucherRedemption.findMany({
      where: { userId: user.id },
      include: {
        voucher: true,
      },
      orderBy: { redeemedAt: 'desc' },
    });

    const redeemedVoucherIds = new Set(redeemedVouchers.map((r: any) => r.voucherId));

    // Get all active vouchers not yet fully consumed
    const activeVouchers = await this.prisma.extended.voucher.findMany({
      where: {
        validTo: { gte: now },
        validFrom: { lte: now },
      },
    }).then((vouchers: any[]) =>
      // Filter out vouchers that have hit their usage limit
      vouchers.filter((v) => v.usageLimit === null || v.usedCount < v.usageLimit)
    ).catch(() => []);

    // Format: redeemed first (as "used"), then remaining available
    const redeemedResult = redeemedVouchers.map((r: any) => ({
      id: r.voucher.id.toString(),
      code: r.voucher.code,
      description: `Đã sử dụng ngày ${new Date(r.redeemedAt).toLocaleDateString('vi-VN')}`,
      discountType: r.voucher.discountType,
      discountPercent: r.voucher.discountType === 'PERCENT' ? Number(r.voucher.discountValue) : null,
      discountAmount: r.voucher.discountType === 'FIXED' ? Number(r.voucher.discountValue) : null,
      expiresAt: r.voucher.validTo,
      status: 'expired',
    }));

    const availableResult = activeVouchers
      .filter((v: any) => !redeemedVoucherIds.has(v.id))
      .map((v: any) => ({
        id: v.id.toString(),
        code: v.code,
        description: v.discountType === 'PERCENT'
          ? `Giảm ${v.discountValue}%`
          : `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}₫`,
        discountType: v.discountType,
        discountPercent: v.discountType === 'PERCENT' ? Number(v.discountValue) : null,
        discountAmount: v.discountType === 'FIXED' ? Number(v.discountValue) : null,
        expiresAt: v.validTo,
        status: 'active',
      }));

    return { data: [...availableResult, ...redeemedResult] };
  }
}
