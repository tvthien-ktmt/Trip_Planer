import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Top 10 điểm du lịch đẹp nhất Việt Nam 2026' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: '<p>Nội dung bài viết...</p>',
    description: 'HTML content',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.tripplanner.vn/blog/cover.jpg' })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 1, description: 'Blog category ID' })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional({ example: [1, 2, 3], description: 'Tag IDs' })
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiPropertyOptional({
    example: 'top-10-diem-du-lich-viet-nam',
    description: 'Custom slug (auto-generated if not provided)',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    example: 'Top 10 điểm du lịch Việt Nam | Trip Planner',
  })
  @IsString()
  @IsOptional()
  @MaxLength(70)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Khám phá 10 điểm du lịch tuyệt đẹp tại Việt Nam...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(160)
  metaDescription?: string;
}

export class UpdateBlogPostDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  tagIds?: number[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class PublishBlogPostDto {
  @ApiProperty({
    example: '2026-08-01T09:00:00Z',
    description:
      'Schedule for future publish (optional, publishes immediately if not provided)',
  })
  @IsOptional()
  scheduledAt?: string;
}

export class CreateBlogCategoryDto {
  @ApiProperty({ example: 'Du lịch trong nước' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'du-lich-trong-nuoc' })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class CreateBlogTagDto {
  @ApiProperty({ example: 'Hà Nội' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ha-noi' })
  @IsString()
  @IsOptional()
  slug?: string;
}
