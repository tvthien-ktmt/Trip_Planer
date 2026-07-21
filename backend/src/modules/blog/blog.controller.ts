import { ParseBigIntPipe } from '../../common/pipes/parse-bigint.pipe';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BlogService } from './blog.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  PublishBlogPostDto,
  CreateBlogCategoryDto,
  CreateBlogTagDto,
} from './dto/blog.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Blog CMS')
@Controller('api/blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ===== Public endpoints =====

  @Get()
  @ApiOperation({ summary: 'List published blog posts (public)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async listPublished(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') categoryId?: number,
    @Query('search') search?: string,
  ) {
    return this.blogService.listPosts({
      status: 'PUBLISHED',
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      categoryId: Number(categoryId) || undefined,
      search,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all blog categories (public)' })
  async listCategories() {
    return this.blogService.listCategories();
  }

  @Get('tags')
  @ApiOperation({ summary: 'List all blog tags (public)' })
  async listTags() {
    return this.blogService.listTags();
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Get blog post by slug (public, increments view count)',
  })
  async getPost(@Param('slug') slug: string) {
    return this.blogService.getPost(slug);
  }

  // ===== Admin/Author endpoints =====

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all posts (admin — includes drafts and scheduled)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'PUBLISHED', 'SCHEDULED'],
  })
  async listAll(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED',
  ) {
    return this.blogService.listPosts({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      status,
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('BLOG_CREATE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post (saves as DRAFT)' })
  async createPost(@Body() dto: CreateBlogPostDto, @CurrentUser() user: any) {
    return this.blogService.createPost(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('BLOG_EDIT')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a blog post (title, content, tags, SEO fields)',
  })
  async updatePost(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateBlogPostDto,
    @CurrentUser() user: any,
  ) {
    return this.blogService.updatePost(
      id,
      dto,
      user.id,
      user.role === 'ADMIN',
    );
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('BLOG_PUBLISH')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Publish a post immediately or schedule for future date',
  })
  async publishPost(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: PublishBlogPostDto) {
    return this.blogService.publishPost(id, dto.scheduledAt);
  }

  @Patch(':id/unpublish')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @Permissions('BLOG_PUBLISH')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unpublish a post (revert to DRAFT)' })
  async unpublishPost(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.blogService.unpublishPost(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN')
  @Permissions('BLOG_DELETE')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post' })
  async deletePost(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.blogService.deletePost(id);
  }

  // ===== Categories & Tags management =====

  @Post('categories')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog category' })
  async createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Post('tags')
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('ADMIN', 'STAFF')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog tag' })
  async createTag(@Body() dto: CreateBlogTagDto) {
    return this.blogService.createTag(dto);
  }
}
