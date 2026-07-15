import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const createStorage = (folder: string) =>
  diskStorage({
    destination: join(process.cwd(), 'uploads', folder),
    filename: (_req, file, cb) => {
      const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        'Only image files are allowed (JPEG, PNG, GIF, WebP)',
      ),
      false,
    );
  }
  cb(null, true);
};

@ApiTags('File Upload')
@Controller('api/upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('avatar')
  @ApiOperation({ summary: 'Upload user avatar (max 5MB, images only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('avatars'),
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const fileUrl = `/uploads/avatars/${file.filename}`;

    // Update user avatarUrl
    await this.prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: fileUrl },
    });

    // Record in MediaFile
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        folderPath: 'avatars',
        uploadedBy: user.id,
      },
    });

    return {
      success: true,
      fileUrl,
      mediaId: mediaFile.id.toString(),
      message: 'Avatar uploaded successfully',
    };
  }

  @Post('blog-image')
  @ApiOperation({ summary: 'Upload a blog post image (max 5MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createStorage('blog'),
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadBlogImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const fileUrl = `/uploads/blog/${file.filename}`;

    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileType: file.mimetype,
        fileSize: file.size,
        folderPath: 'blog',
        uploadedBy: user.id,
      },
    });

    return {
      success: true,
      fileUrl,
      mediaId: mediaFile.id.toString(),
    };
  }

  @Post('gallery')
  @ApiOperation({
    summary: 'Upload multiple images to gallery (max 10 files, 5MB each)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: createStorage('gallery'),
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadGallery(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const fileUrl = `/uploads/gallery/${file.filename}`;

        const mediaFile = await this.prisma.mediaFile.create({
          data: {
            fileName: file.originalname,
            fileUrl,
            fileType: file.mimetype,
            fileSize: file.size,
            folderPath: 'gallery',
            uploadedBy: user.id,
          },
        });

        return {
          fileUrl,
          mediaId: mediaFile.id.toString(),
          originalName: file.originalname,
          size: file.size,
        };
      }),
    );

    return {
      success: true,
      count: results.length,
      files: results,
    };
  }

  @Get('media')
  @ApiOperation({ summary: 'List uploaded files (media library)' })
  async listMedia(
    @CurrentUser() user: any,
    @Query('folder') folder?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const skip = ((Number(page) || 1) - 1) * (Number(limit) || 20);
    const where: any = { uploadedBy: user.id };
    if (folder) where.folderPath = folder;

    const [total, files] = await Promise.all([
      this.prisma.mediaFile.count({ where }),
      this.prisma.mediaFile.findMany({
        where,
        skip,
        take: Number(limit) || 20,
        orderBy: { id: 'desc' },
      }),
    ]);

    return {
      data: files.map((f) => ({
        ...f,
        id: f.id.toString(),
        uploadedBy: f.uploadedBy.toString(),
        sizeKb: Math.round(f.fileSize / 1024),
      })),
      pagination: {
        total,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        totalPages: Math.ceil(total / (Number(limit) || 20)),
      },
    };
  }

  @Delete('media/:id')
  @ApiOperation({ summary: 'Delete an uploaded file' })
  async deleteMedia(@Param('id') id: string, @CurrentUser() user: any) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id: BigInt(id) },
    });
    if (!file) throw new BadRequestException('File not found');
    if (file.uploadedBy !== user.id && user.role !== 'ADMIN') {
      throw new BadRequestException('You can only delete your own files');
    }

    // In production: delete from disk/S3 as well
    await this.prisma.mediaFile.delete({ where: { id: BigInt(id) } });

    return { success: true, message: 'File deleted' };
  }
}
