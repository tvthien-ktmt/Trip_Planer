-- AlterTable
ALTER TABLE `User` ADD COLUMN `lockReason` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `transferContent` VARCHAR(191) NULL,
ADD COLUMN `expiredAt` DATETIME(3) NULL,
MODIFY `method` ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'SEPAY') NOT NULL,
MODIFY `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'EXPIRED', 'LATE_PAYMENT') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `ReviewVote` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reviewId` BIGINT NOT NULL,
    `userId` BIGINT NOT NULL,
    `isUpvote` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ReviewVote_userId_idx`(`userId`),
    UNIQUE INDEX `ReviewVote_reviewId_userId_key`(`reviewId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewVote` ADD CONSTRAINT `ReviewVote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX `FlightSeat_flightId_seatCode_key` ON `FlightSeat`(`flightId`, `seatCode`);

-- DropIndex
DROP INDEX `Payment_transactionRef_idx` ON `Payment`;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_transactionRef_key` ON `Payment`(`transactionRef`);

-- CreateIndex
CREATE UNIQUE INDEX `Payment_transferContent_key` ON `Payment`(`transferContent`);

-- CreateIndex
CREATE UNIQUE INDEX `RefreshToken_tokenHint_key` ON `RefreshToken`(`tokenHint`);
