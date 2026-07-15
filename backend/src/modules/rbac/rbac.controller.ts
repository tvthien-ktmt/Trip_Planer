import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuthorizationGuard } from '../../common/guards/authorization.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';

// Predefined permission codes grouped by module
export const PERMISSION_DEFINITIONS = [
  // Booking
  { code: 'BOOKING_READ', description: 'View bookings', module: 'BOOKING' },
  { code: 'BOOKING_CREATE', description: 'Create bookings', module: 'BOOKING' },
  { code: 'BOOKING_CANCEL', description: 'Cancel bookings', module: 'BOOKING' },
  {
    code: 'BOOKING_UPDATE_STATUS',
    description: 'Update booking status',
    module: 'BOOKING',
  },

  // Payment
  { code: 'PAYMENT_VIEW', description: 'View payments', module: 'PAYMENT' },
  { code: 'PAYMENT_REFUND', description: 'Process refunds', module: 'PAYMENT' },
  {
    code: 'PAYMENT_EXPORT',
    description: 'Export payment reports',
    module: 'PAYMENT',
  },

  // User management
  { code: 'USER_READ', description: 'View user profiles', module: 'USER' },
  {
    code: 'USER_LOCK',
    description: 'Lock/unlock user accounts',
    module: 'USER',
  },
  { code: 'USER_DELETE', description: 'Delete user accounts', module: 'USER' },
  { code: 'USER_EDIT', description: 'Edit user data', module: 'USER' },

  // Blog / Content
  { code: 'BLOG_CREATE', description: 'Create blog posts', module: 'BLOG' },
  { code: 'BLOG_EDIT', description: 'Edit blog posts', module: 'BLOG' },
  {
    code: 'BLOG_PUBLISH',
    description: 'Publish/unpublish blog posts',
    module: 'BLOG',
  },
  { code: 'BLOG_DELETE', description: 'Delete blog posts', module: 'BLOG' },

  // Flight
  { code: 'FLIGHT_CREATE', description: 'Create flights', module: 'FLIGHT' },
  { code: 'FLIGHT_EDIT', description: 'Edit flight details', module: 'FLIGHT' },
  { code: 'FLIGHT_DELETE', description: 'Delete flights', module: 'FLIGHT' },

  // Tour
  { code: 'TOUR_CREATE', description: 'Create tours', module: 'TOUR' },
  { code: 'TOUR_EDIT', description: 'Edit tour details', module: 'TOUR' },
  { code: 'TOUR_DELETE', description: 'Delete tours', module: 'TOUR' },

  // Voucher
  { code: 'VOUCHER_CREATE', description: 'Create vouchers', module: 'VOUCHER' },
  { code: 'VOUCHER_EDIT', description: 'Edit vouchers', module: 'VOUCHER' },
  { code: 'VOUCHER_DELETE', description: 'Delete vouchers', module: 'VOUCHER' },

  // Analytics
  {
    code: 'ANALYTICS_VIEW',
    description: 'View analytics dashboard',
    module: 'ANALYTICS',
  },
  {
    code: 'ANALYTICS_EXPORT',
    description: 'Export analytics data',
    module: 'ANALYTICS',
  },

  // System
  {
    code: 'SYSTEM_SETTINGS',
    description: 'Manage system settings',
    module: 'SYSTEM',
  },
  { code: 'AUDIT_LOG_VIEW', description: 'View audit logs', module: 'SYSTEM' },
  {
    code: 'RBAC_MANAGE',
    description: 'Manage roles and permissions',
    module: 'SYSTEM',
  },
];

class AssignPermissionDto {
  @ApiProperty({ example: 'ADMIN', enum: ['USER', 'STAFF', 'ADMIN'] })
  @IsEnum(['USER', 'STAFF', 'ADMIN'])
  role: 'USER' | 'STAFF' | 'ADMIN';

  @ApiProperty({ example: 1, description: 'Permission ID to assign' })
  permissionId: number;
}

class CreatePermissionDto {
  @ApiProperty({
    example: 'CUSTOM_ACTION',
    description: 'Unique permission code',
  })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Description of what this permission allows' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'BOOKING',
    description: 'Module this permission belongs to',
  })
  @IsString()
  @IsOptional()
  module?: string;
}

@ApiTags('RBAC (Admin)')
@Controller('api/admin/rbac')
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('permissions')
  @ApiOperation({ summary: 'List all available permissions' })
  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.prisma.permission.create({ data: dto });
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all roles with their assigned permissions' })
  async listRolesWithPermissions() {
    const roles = ['USER', 'STAFF', 'ADMIN'];
    const result = [];

    for (const role of roles) {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: { role: role as any },
        include: { permission: true },
      });
      result.push({
        role,
        permissions: rolePermissions.map((rp) => rp.permission),
        permissionCount: rolePermissions.length,
      });
    }

    return result;
  }

  @Post('role-permissions')
  @ApiOperation({ summary: 'Assign a permission to a role' })
  async assignPermission(@Body() dto: AssignPermissionDto) {
    return this.prisma.rolePermission.upsert({
      where: {
        role_permissionId: {
          role: dto.role as any,
          permissionId: BigInt(dto.permissionId),
        },
      },
      create: {
        role: dto.role as any,
        permissionId: BigInt(dto.permissionId),
      },
      update: {},
    });
  }

  @Delete('role-permissions/:role/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  async removePermission(
    @Param('role') role: string,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.prisma.rolePermission.delete({
      where: {
        role_permissionId: {
          role: role as any,
          permissionId: BigInt(permissionId),
        },
      },
    });
  }

  @Post('seed-defaults')
  @ApiOperation({
    summary: 'Seed default permissions and assign all to ADMIN role',
  })
  async seedDefaultPermissions() {
    // Create all predefined permissions
    await this.prisma.permission.createMany({
      data: PERMISSION_DEFINITIONS,
      skipDuplicates: true,
    });

    const permissions = await this.prisma.permission.findMany();

    // Assign all permissions to ADMIN
    await this.prisma.rolePermission.createMany({
      data: permissions.map((p) => ({
        role: 'ADMIN' as any,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    // Assign basic permissions to STAFF
    const staffPermCodes = [
      'BOOKING_READ',
      'BOOKING_UPDATE_STATUS',
      'PAYMENT_VIEW',
      'USER_READ',
      'BLOG_CREATE',
      'BLOG_EDIT',
      'BLOG_PUBLISH',
      'FLIGHT_CREATE',
      'FLIGHT_EDIT',
      'TOUR_CREATE',
      'TOUR_EDIT',
      'VOUCHER_CREATE',
      'ANALYTICS_VIEW',
    ];

    const staffPerms = permissions.filter((p) =>
      staffPermCodes.includes(p.code),
    );
    await this.prisma.rolePermission.createMany({
      data: staffPerms.map((p) => ({
        role: 'STAFF' as any,
        permissionId: p.id,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      permissionsCreated: permissions.length,
      message:
        'Default permissions seeded. ADMIN has all permissions. STAFF has limited permissions.',
    };
  }
}
