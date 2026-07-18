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
import { memoryStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
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

const createStorage = () => memoryStorage();

const imageFilter = (_req: any, file: Express.Multer.File, cb: any) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        'Only image files are allowed (JPEG, PNG, GIF, WebP)',
      ),
      false,
    );
  }
  
  // BE-044 fix: Force safe extensions based on mimetype
  const ext = extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  if (!allowedExts.includes(ext)) {
    return cb(
      new BadRequestException('Invalid file extension'),
      false,
    );
  }
  
  cb(null, true);
};

// BE-043 fix: Validate magic bytes to prevent spoofing
async function validateImageSignature(buffer: Buffer): Promise<boolean> {
  const hex = buffer.toString('hex', 0, 12).toUpperCase();

  // JPEG: FF D8 FF
  if (hex.startsWith('FFD8FF')) return true;
  // PNG: 89 50 4E 47
  if (hex.startsWith('89504E47')) return true;
  // GIF: 47 49 46 38
  if (hex.startsWith('47494638')) return true;
  // WebP: RIFF ... WEBP
  if (hex.startsWith('52494646') && hex.substring(16, 24) === '57454250') return true;

  return false;
}

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
      storage: createStorage(),
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // BE-043 fix: validate magic bytes
    const isValid = await validateImageSignature(file.buffer);
    if (!isValid) {
      throw new BadRequestException('Invalid file signature (spoofed extension detected)');
    }

    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    const folderPath = join(process.cwd(), 'uploads', 'avatars');
    await fs.promises.mkdir(folderPath, { recursive: true });
    await fs.promises.writeFile(join(folderPath, uniqueName), file.buffer);

    const fileUrl = `/uploads/avatars/${uniqueName}`;

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
      storage: createStorage(),
      fileFilter: imageFilter,
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async uploadBlogImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    // BE-043 fix: validate magic bytes
    const isValid = await validateImageSignature(file.buffer);
    if (!isValid) {
      throw new BadRequestException('Invalid file signature');
    }

    const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
    const folderPath = join(process.cwd(), 'uploads', 'blog');
    await fs.promises.mkdir(folderPath, { recursive: true });
    await fs.promises.writeFile(join(folderPath, uniqueName), file.buffer);

    const fileUrl = `/uploads/blog/${uniqueName}`;

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
      storage: createStorage(),
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

    // Validate all signatures first
    for (const file of files) {
      const isValid = await validateImageSignature(file.buffer);
      if (!isValid) {
        throw new BadRequestException(`Invalid file signature detected in file: ${file.originalname}`);
      }
    }

    const folderPath = join(process.cwd(), 'uploads', 'gallery');
    await fs.promises.mkdir(folderPath, { recursive: true });

    const results = await Promise.all(
      files.map(async (file) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        await fs.promises.writeFile(join(folderPath, uniqueName), file.buffer);
        const fileUrl = `/uploads/gallery/${uniqueName}`;

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
    if (file.fileUrl) {
      const filePath = join(process.cwd(), file.fileUrl);
      const uploadsDir = join(process.cwd(), 'uploads');
      // BE-021 fix: Prevent directory traversal when unlinking
      if (filePath.startsWith(uploadsDir)) {
        await fs.promises.unlink(filePath).catch((err) => {
          console.error(`Failed to delete file ${filePath}:`, err);
        });
      }
    }
    await this.prisma.mediaFile.delete({ where: { id: BigInt(id) } });

    return { success: true, message: 'File deleted' };
  }
}
