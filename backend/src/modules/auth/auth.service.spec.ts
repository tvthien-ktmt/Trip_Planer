import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { EmailService } from '../email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ===== Mocks =====
const mockPrisma: any = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  otpCode: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  loginHistory: {
    create: jest.fn(),
    count: jest.fn(),
  },
  userDevice: {
    upsert: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  userSession: {
    updateMany: jest.fn(),
  },
  activityLog: {
    findFirst: jest.fn(),
  },
};
mockPrisma.extended = mockPrisma;

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_access_token'),
  decode: jest
    .fn()
    .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 900 }),
};

const mockCacheManager = {
  set: jest.fn(),
  get: jest.fn().mockResolvedValue(null),
};

const mockSessionService = {
  createSession: jest.fn().mockResolvedValue('mock_session_token'),
};

const mockActivityLog = {
  log: jest.fn().mockResolvedValue(undefined),
  getUserActivity: jest.fn(),
};

const mockEmailService = {
  sendVerifyEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordReset: jest.fn().mockResolvedValue(undefined),
  sendBookingConfirmation: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ActivityLogService, useValue: mockActivityLog },
        { provide: EmailService, useValue: mockEmailService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    mockCacheManager.get.mockResolvedValue(null); // Default: token not blacklisted
  });

  // ===== generateOtp =====
  describe('generateOtp', () => {
    it('should throw if email already exists for REGISTER', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'test@example.com',
      });

      await expect(
        service.generateOtp('test@example.com', 'REGISTER'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if user not found for RESET_PASSWORD', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.generateOtp('notfound@example.com', 'RESET_PASSWORD'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create OTP and enqueue email for REGISTER', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.otpCode.create.mockResolvedValue({ id: BigInt(1) });

      const result = await service.generateOtp('new@example.com', 'REGISTER');

      expect(result.message).toBe('OTP sent successfully');
      expect(mockPrisma.otpCode.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ purpose: 'REGISTER' }),
        }),
      );
      expect(mockEmailService.sendVerifyEmail).toHaveBeenCalled();
    });

    it('should send password reset email for RESET_PASSWORD', async () => {
      const user = {
        id: BigInt(1),
        email: 'user@example.com',
        fullName: 'Test User',
      };
      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.otpCode.create.mockResolvedValue({ id: BigInt(1) });

      await service.generateOtp('user@example.com', 'RESET_PASSWORD');

      expect(mockEmailService.sendPasswordReset).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          fullName: 'Test User',
        }),
      );
    });
  });

  // ===== register =====
  describe('register', () => {
    it('should throw if OTP not found', async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue(null);

      await expect(
        service.register({
          email: 'e@e.com',
          password: 'pass',
          fullName: 'Test',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP expired', async () => {
      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: BigInt(1),
        codeHash: 'hash',
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });

      await expect(
        service.register({
          email: 'e@e.com',
          password: 'pass',
          fullName: 'Test',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP is wrong', async () => {
      const realHash = await bcrypt.hash('999999', 10);
      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: BigInt(1),
        codeHash: realHash,
        expiresAt: new Date(Date.now() + 60000),
      });

      await expect(
        service.register({
          email: 'e@e.com',
          password: 'pass',
          fullName: 'Test',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should register user successfully with valid OTP', async () => {
      const realOtp = '123456';
      const realHash = await bcrypt.hash(realOtp, 10);

      mockPrisma.otpCode.findFirst.mockResolvedValue({
        id: BigInt(1),
        codeHash: realHash,
        expiresAt: new Date(Date.now() + 60000),
      });
      mockPrisma.otpCode.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.user.create.mockResolvedValue({
        id: BigInt(42),
        email: 'new@example.com',
        fullName: 'New User',
        role: 'USER',
        avatarUrl: null,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
        otp: realOtp,
      });

      expect(result.access_token).toBe('mock_access_token');
      expect(result.user.email).toBe('new@example.com');
      expect(mockActivityLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_REGISTER' }),
      );
    });
  });

  // ===== login =====
  describe('login', () => {
    it('should throw if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login(
          { email: 'notfound@example.com', password: 'pass' },
          '127.0.0.1',
          'Chrome',
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if account is locked', async () => {
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 1n,
        email: 'user@example.com',
        passwordHash: 'hashed_password',
        status: 'LOCKED',
      });
      (mockPrisma.activityLog.findFirst as jest.Mock).mockResolvedValueOnce({
        createdAt: new Date(),
      });

      await expect(service.login({ email: 'user@example.com', password: 'correct_password' }, '127.0.0.1', 'Chrome')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw on wrong password and log failure', async () => {
      const realHash = await bcrypt.hash('correctpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'user@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
      });
      mockPrisma.loginHistory.create.mockResolvedValue({});
      mockPrisma.loginHistory.count.mockResolvedValue(1); // Less than 5 failures

      await expect(
        service.login(
          { email: 'user@example.com', password: 'wrongpass' },
          '127.0.0.1',
          'Chrome',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.loginHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ success: false }),
        }),
      );
    });

    it('should lock account after 5 failed logins', async () => {
      const realHash = await bcrypt.hash('correctpass', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: BigInt(1),
        email: 'user@example.com',
        passwordHash: realHash,
        status: 'ACTIVE',
      });
      mockPrisma.loginHistory.create.mockResolvedValue({});
      mockPrisma.loginHistory.count.mockResolvedValue(5); // Exactly 5 failures → lock
      mockPrisma.user.update.mockResolvedValue({});

      await expect(
        service.login(
          { email: 'user@example.com', password: 'wrongpass' },
          '127.0.0.1',
          'Chrome',
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'LOCKED' }),
        }),
      );
    });

    it('should login successfully with correct credentials', async () => {
      const realHash = await bcrypt.hash('correctpass', 10);
      const mockUser = {
        id: BigInt(1),
        email: 'user@example.com',
        fullName: 'Test User',
        passwordHash: realHash,
        status: 'ACTIVE',
        role: 'USER',
        avatarUrl: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginHistory.create.mockResolvedValue({});
      (mockPrisma.userDevice.upsert as jest.Mock).mockResolvedValueOnce({ id: 1n });
      mockPrisma.userDevice.findFirst.mockResolvedValue({ id: BigInt(1) });
      mockPrisma.userDevice.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(
        { email: 'user@example.com', password: 'correctpass' },
        '127.0.0.1',
        'Mozilla/5.0 Chrome/120',
      );

      expect(result.access_token).toBe('mock_access_token');
      expect(result.user.email).toBe('user@example.com');
      expect(result.session_token).toBe('mock_session_token');
      expect(mockActivityLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'USER_LOGIN' }),
      );
    });
  });

  // ===== isTokenBlacklisted =====
  describe('isTokenBlacklisted', () => {
    it('should return false for non-blacklisted token', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      const result = await service.isTokenBlacklisted('some_token');
      expect(result).toBe(false);
    });

    it('should return true for blacklisted token', async () => {
      mockCacheManager.get.mockResolvedValue(true);
      const result = await service.isTokenBlacklisted('blacklisted_token');
      expect(result).toBe(true);
    });
  });

  // ===== refreshToken — Token Rotation =====
  describe('refreshToken', () => {
    it('should throw if refresh token not found', async () => {
      mockPrisma.refreshToken.findMany.mockResolvedValue([]);

      await expect(service.refreshToken('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should revoke all tokens when reused revoked token is detected (theft detection)', async () => {
      const rawToken = 'stolen_token';
      const tokenHash = await bcrypt.hash(rawToken, 10);

      mockPrisma.refreshToken.findMany.mockResolvedValue([
        {
          id: BigInt(1),
          userId: BigInt(1),
          tokenHash,
          revokedAt: new Date(), // Already revoked — theft!
          expiresAt: new Date(Date.now() + 86400000),
          deviceInfo: null,
        },
      ]);
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });
      mockPrisma.userSession.updateMany.mockResolvedValue({ count: 2 });

      await expect(service.refreshToken(rawToken)).rejects.toThrow(
        UnauthorizedException,
      );

      // All tokens should be revoked
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ revokedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
