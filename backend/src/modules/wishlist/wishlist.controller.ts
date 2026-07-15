import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wishlist')
@Controller('api/wishlists')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist' })
  async getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle wishlist item' })
  async toggleWishlist(
    @CurrentUser() user: any,
    @Body('itemType') itemType: 'TOUR' | 'DESTINATION' | 'WONDER',
    @Body('itemId') itemId: string,
  ) {
    return this.wishlistService.toggleWishlist(
      user.id,
      itemType,
      BigInt(itemId),
    );
  }
}
