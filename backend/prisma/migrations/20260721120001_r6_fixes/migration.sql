-- R6-DB-001 fix: 8 NEW migration drift items found in commit 03ba5cf
-- Fixes: AuditLog.action/targetType enum, BookingStatusHistory enum, FULLTEXT ×3, DROP redundant index

-- 1. AuditLog.action — schema changed to AuditAction enum (was VARCHAR(191))
ALTER TABLE `AuditLog` MODIFY `action` ENUM('CREATE','UPDATE','DELETE','RESTORE','LOCK','UNLOCK','LOGIN','LOGOUT') NOT NULL;

-- 2. AuditLog.targetType — schema changed to AuditTarget enum (was VARCHAR(191))
ALTER TABLE `AuditLog` MODIFY `targetType` ENUM('USER','BOOKING','FLIGHT','TOUR','PROMO','SETTING','BLOG','REVIEW') NOT NULL;

-- 3. BookingStatusHistory.fromStatus — schema changed to BookingStatus enum (was VARCHAR(191))
ALTER TABLE `BookingStatusHistory` MODIFY `fromStatus` ENUM('DRAFT','PENDING_PAYMENT','CONFIRMED','CANCELLED','COMPLETED') NULL;

-- 4. BookingStatusHistory.toStatus — schema changed to BookingStatus enum (was VARCHAR(191))
ALTER TABLE `BookingStatusHistory` MODIFY `toStatus` ENUM('DRAFT','PENDING_PAYMENT','CONFIRMED','CANCELLED','COMPLETED') NOT NULL;

-- 5. Destination FULLTEXT index (schema has @@fulltext([name]))
CREATE FULLTEXT INDEX `Destination_name_ft_idx` ON `Destination`(`name`);

-- 6. Tour FULLTEXT index (schema has @@fulltext([title, description]))
CREATE FULLTEXT INDEX `Tour_title_description_ft_idx` ON `Tour`(`title`, `description`);

-- 7. BlogPost FULLTEXT index (schema has @@fulltext([title, content]))
-- Already exists via generator previewFeatures but migration wasn't created
CREATE FULLTEXT INDEX `BlogPost_title_content_ft_idx` ON `BlogPost`(`title`, `content`);

-- 8. Drop redundant RefreshToken_tokenHint_idx (covered by UNIQUE index RefreshToken_tokenHint_key)
DROP INDEX `RefreshToken_tokenHint_idx` ON `RefreshToken`;
