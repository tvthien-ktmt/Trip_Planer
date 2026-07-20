import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  CreateBlogCategoryDto,
  CreateBlogTagDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ===== Blog Posts =====

  async createPost(dto: CreateBlogPostDto, authorId: bigint) {
    const slug = dto.slug || this.generateSlug(dto.title);

    // Check slug uniqueness
    const existing = await this.prisma.extended.blogPost.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(
        `Slug "${slug}" already exists. Please provide a custom slug.`,
      );
    }

    const { tagIds, categoryId, ...postData } = dto;

    const post = await this.prisma.extended.blogPost.create({
      data: {
        ...postData,
        slug,
        authorId,
        categoryId: categoryId ? BigInt(categoryId) : null,
        status: 'DRAFT',
        tags: tagIds
          ? {
              create: tagIds.map((tagId) => ({
                tagId: BigInt(tagId),
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return this.formatPost(post);
  }

  async updatePost(
    id: bigint,
    dto: UpdateBlogPostDto,
    userId: bigint,
    isAdmin = false,
  ) {
    const post = await this.prisma.extended.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    // Only author or admin can edit
    if (!isAdmin && post.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    const { tagIds, categoryId, ...postData } = dto;

    // BE-056 fix: Wrap in transaction
    const updated = await this.prisma.extended.$transaction(async (tx) => {
      if (tagIds !== undefined) {
        await tx.blogPostTag.deleteMany({ where: { postId: id } });
      }

      return tx.blogPost.update({
        where: { id },
        data: {
          ...postData,
          categoryId: categoryId ? BigInt(categoryId) : undefined,
          tags: tagIds
            ? {
                create: tagIds.map((tagId) => ({
                  tagId: BigInt(tagId),
                })),
              }
            : undefined,
        },
        include: {
          tags: { include: { tag: true } },
        },
      });
    });

    return this.formatPost(updated);
  }

  async publishPost(id: bigint, scheduledAt?: string) {
    const post = await this.prisma.extended.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    if (scheduledAt) {
      // Schedule for future publish
      const scheduleDate = new Date(scheduledAt);
      return this.prisma.extended.blogPost.update({
        where: { id },
        data: {
          status: 'SCHEDULED',
          scheduledAt: scheduleDate,
        },
      });
    }

    // Publish immediately
    return this.prisma.extended.blogPost.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        scheduledAt: null,
      },
    });
  }

  async unpublishPost(id: bigint) {
    const post = await this.prisma.extended.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    return this.prisma.extended.blogPost.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null, scheduledAt: null },
    });
  }

  async deletePost(id: bigint) {
    const post = await this.prisma.extended.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');

    await this.prisma.extended.blogPostTag.deleteMany({ where: { postId: id } });
    await this.prisma.extended.blogPost.delete({ where: { id } });

    return { success: true };
  }

  async getPost(slug: string) {
    const post = await this.prisma.extended.blogPost.findUnique({
      where: { slug },
      include: {
        tags: { include: { tag: true } },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');

    // Increment view count
    await this.prisma.extended.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return this.formatPost(post);
  }

  async listPosts(options: {
    page?: number;
    limit?: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
    categoryId?: number;
    search?: string;
    authorId?: bigint;
  }) {
    const {
      page = 1,
      limit = 10,
      status,
      categoryId,
      search,
      authorId,
    } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = BigInt(categoryId);
    if (authorId) where.authorId = authorId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { metaDescription: { contains: search } },
      ];
    }

    const [total, posts] = await Promise.all([
      this.prisma.extended.blogPost.count({ where }),
      this.prisma.extended.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tags: { include: { tag: true } },
        },
      }),
    ]);

    return {
      data: posts.map((p: any) => ({
        ...p,
        id: p.id.toString(),
        categoryId: p.categoryId?.toString(),
        authorId: p.authorId?.toString(),
        tags: p.tags?.map((t: any) => ({
          id: t.tag.id.toString(),
          name: t.tag.name,
          slug: t.tag.slug,
        })),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ===== Categories =====

  async createCategory(dto: CreateBlogCategoryDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    return this.prisma.extended.blogCategory.create({ data: { name: dto.name, slug } });
  }

  async listCategories() {
    return this.prisma.extended.blogCategory.findMany({ orderBy: { name: 'asc' } });
  }

  // ===== Tags =====

  async createTag(dto: CreateBlogTagDto) {
    const slug = dto.slug || this.generateSlug(dto.name);
    return this.prisma.extended.blogTag.upsert({
      where: { slug },
      create: { name: dto.name, slug },
      update: {},
    });
  }

  async listTags() {
    return this.prisma.extended.blogTag.findMany({ orderBy: { name: 'asc' } });
  }

  // ===== Helpers =====

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      .substring(0, 100);
  }

  private formatPost(post: any) {
    return {
      ...post,
      id: post.id.toString(),
      categoryId: post.categoryId?.toString(),
      authorId: post.authorId?.toString(),
      tags: post.tags?.map((t: any) => ({
        id: t.tag.id.toString(),
        name: t.tag.name,
        slug: t.tag.slug,
      })),
    };
  }
}
