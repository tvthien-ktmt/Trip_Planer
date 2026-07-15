-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `nationalId` VARCHAR(191) NULL,
    `passportNo` VARCHAR(191) NULL,
    `role` ENUM('USER', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'USER',
    `status` ENUM('ACTIVE', 'LOCKED', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'PENDING_VERIFICATION',
    `emailVerifiedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `module` VARCHAR(191) NULL,

    UNIQUE INDEX `Permission_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RolePermission` (
    `role` ENUM('USER', 'STAFF', 'ADMIN') NOT NULL,
    `permissionId` BIGINT NOT NULL,

    INDEX `RolePermission_role_idx`(`role`),
    PRIMARY KEY (`role`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `deviceInfo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtpCode` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `purpose` ENUM('REGISTER', 'RESET_PASSWORD', 'LOGIN_2FA') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `consumedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LoginHistory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `device` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `loginAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `success` BOOLEAN NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDevice` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `deviceFingerprint` VARCHAR(191) NOT NULL,
    `deviceName` VARCHAR(191) NULL,
    `lastActiveAt` DATETIME(3) NOT NULL,
    `isTrusted` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `deviceName` VARCHAR(191) NULL,
    `deviceType` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastActiveAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UserSession_sessionToken_key`(`sessionToken`),
    INDEX `UserSession_userId_idx`(`userId`),
    INDEX `UserSession_sessionToken_idx`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airport` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `iataCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Airport_iataCode_key`(`iataCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(191) NOT NULL,
    `manufacturer` VARCHAR(191) NOT NULL,
    `totalSeats` INTEGER NOT NULL,
    `seatMapConfig` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `flightNumber` VARCHAR(191) NOT NULL,
    `airlineName` VARCHAR(191) NOT NULL,
    `aircraftId` BIGINT NOT NULL,
    `departureAirportId` BIGINT NOT NULL,
    `arrivalAirportId` BIGINT NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `arrivalTime` DATETIME(3) NOT NULL,
    `status` ENUM('SCHEDULED', 'DELAYED', 'CANCELLED', 'LANDED') NOT NULL DEFAULT 'SCHEDULED',

    INDEX `Flight_departureAirportId_arrivalAirportId_departureTime_idx`(`departureAirportId`, `arrivalAirportId`, `departureTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightFareClass` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `flightId` BIGINT NOT NULL,
    `className` ENUM('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS') NOT NULL,
    `basePrice` DECIMAL(65, 30) NOT NULL,
    `availableSeats` INTEGER NOT NULL,
    `baggageAllowanceKg` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightSeat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `flightId` BIGINT NOT NULL,
    `seatCode` VARCHAR(191) NOT NULL,
    `fareClassId` BIGINT NOT NULL,
    `status` ENUM('AVAILABLE', 'LOCKED', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    `extraFee` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `version` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Destination` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL,
    `type` ENUM('VIETNAM', 'INTERNATIONAL') NOT NULL,
    `tags` JSON NOT NULL,
    `description` TEXT NULL,
    `coverImageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tour` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `destinationId` BIGINT NOT NULL,
    `description` TEXT NULL,
    `durationDays` INTEGER NOT NULL,
    `basePrice` DECIMAL(65, 30) NOT NULL,
    `discountPercent` INTEGER NOT NULL DEFAULT 0,
    `ratingAvg` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourItinerary` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tourId` BIGINT NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourImage` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `tourId` BIGINT NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bookingCode` VARCHAR(191) NOT NULL,
    `userId` BIGINT NOT NULL,
    `type` ENUM('FLIGHT', 'TOUR') NOT NULL,
    `status` ENUM('DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `totalAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
    `expiresAt` DATETIME(3) NULL,

    UNIQUE INDEX `Booking_bookingCode_key`(`bookingCode`),
    INDEX `Booking_userId_idx`(`userId`),
    INDEX `Booking_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingPassenger` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bookingId` BIGINT NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `nationality` VARCHAR(191) NULL,
    `passportNo` VARCHAR(191) NULL,
    `seatId` BIGINT NULL,
    `fareClassId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingItem` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bookingId` BIGINT NOT NULL,
    `itemType` ENUM('BAGGAGE', 'MEAL', 'ADDON', 'TOUR_SLOT') NOT NULL,
    `itemRefId` BIGINT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unitPrice` DECIMAL(65, 30) NOT NULL,
    `subtotal` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BookingStatusHistory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bookingId` BIGINT NOT NULL,
    `fromStatus` VARCHAR(191) NULL,
    `toStatus` VARCHAR(191) NOT NULL,
    `changedBy` BIGINT NULL,
    `changedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `bookingId` BIGINT NOT NULL,
    `method` ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'VNPAY', 'MOMO') NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `transactionRef` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Payment_bookingId_key`(`bookingId`),
    UNIQUE INDEX `Payment_idempotencyKey_key`(`idempotencyKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Refund` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paymentId` BIGINT NOT NULL,
    `amount` DECIMAL(65, 30) NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('REQUESTED', 'PROCESSING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `processedBy` BIGINT NULL,
    `processedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Voucher` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `discountType` ENUM('PERCENT', 'FIXED') NOT NULL,
    `discountValue` DECIMAL(65, 30) NOT NULL,
    `minOrderAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `maxDiscountAmount` DECIMAL(65, 30) NULL,
    `validFrom` DATETIME(3) NOT NULL,
    `validTo` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Voucher_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VoucherRedemption` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `voucherId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `bookingId` BIGINT NOT NULL,
    `redeemedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VoucherRedemption_voucherId_bookingId_key`(`voucherId`, `bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Review` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `reviewableType` ENUM('TOUR', 'FLIGHT') NOT NULL,
    `reviewableId` BIGINT NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `images` JSON NULL,
    `helpfulCount` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PUBLISHED', 'HIDDEN') NOT NULL DEFAULT 'PUBLISHED',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wishlist` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `itemType` ENUM('TOUR', 'DESTINATION', 'WONDER') NOT NULL,
    `itemId` BIGINT NOT NULL,

    UNIQUE INDEX `Wishlist_userId_itemType_itemId_key`(`userId`, `itemType`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MembershipTier` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `minPoints` INTEGER NOT NULL,
    `benefits` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserPoints` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `pointsBalance` INTEGER NOT NULL DEFAULT 0,
    `tierId` BIGINT NULL,

    UNIQUE INDEX `UserPoints_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PointTransaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `bookingId` BIGINT NULL,
    `pointsChange` INTEGER NOT NULL,
    `reason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPost` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `coverImageUrl` VARCHAR(191) NULL,
    `categoryId` BIGINT NULL,
    `authorId` BIGINT NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `metaTitle` VARCHAR(191) NULL,
    `metaDescription` TEXT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BlogPost_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogTag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BlogTag_name_key`(`name`),
    UNIQUE INDEX `BlogTag_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogPostTag` (
    `postId` BIGINT NOT NULL,
    `tagId` BIGINT NOT NULL,

    PRIMARY KEY (`postId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BlogCategory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BlogCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaFile` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `folderPath` VARCHAR(191) NULL,
    `uploadedBy` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Faq` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `question` VARCHAR(191) NOT NULL,
    `answer` TEXT NOT NULL,
    `category` VARCHAR(191) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `type` ENUM('SYSTEM', 'PROMOTION', 'BOOKING_UPDATE') NOT NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactSubmission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'RESOLVED') NOT NULL DEFAULT 'NEW',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationTemplate` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'IN_APP') NOT NULL,
    `subject` VARCHAR(191) NULL,
    `bodyTemplate` TEXT NOT NULL,

    UNIQUE INDEX `NotificationTemplate_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `adminUserId` BIGINT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` BIGINT NULL,
    `beforeData` JSON NULL,
    `afterData` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SystemSetting` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `settingKey` VARCHAR(191) NOT NULL,
    `settingValue` TEXT NOT NULL,
    `isEncrypted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `SystemSetting_settingKey_key`(`settingKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LoginHistory` ADD CONSTRAINT `LoginHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDevice` ADD CONSTRAINT `UserDevice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightFareClass` ADD CONSTRAINT `FlightFareClass_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightSeat` ADD CONSTRAINT `FlightSeat_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourItinerary` ADD CONSTRAINT `TourItinerary_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourImage` ADD CONSTRAINT `TourImage_tourId_fkey` FOREIGN KEY (`tourId`) REFERENCES `Tour`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingPassenger` ADD CONSTRAINT `BookingPassenger_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingItem` ADD CONSTRAINT `BookingItem_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookingStatusHistory` ADD CONSTRAINT `BookingStatusHistory_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostTag` ADD CONSTRAINT `BlogPostTag_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BlogPostTag` ADD CONSTRAINT `BlogPostTag_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `BlogTag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
