-- CreateIndex
CREATE INDEX `Payment_transactionRef_idx` ON `Payment`(`transactionRef`);

-- R3-DB-001: Add CHECK constraints
ALTER TABLE `Review` ADD CONSTRAINT `chk_review_rating` CHECK (`rating` >= 1 AND `rating` <= 5);
ALTER TABLE `Tour` ADD CONSTRAINT `chk_tour_discount` CHECK (`discountPercent` >= 0 AND `discountPercent` <= 100);
ALTER TABLE `UserPoints` ADD CONSTRAINT `chk_user_points` CHECK (`pointsBalance` >= 0);
