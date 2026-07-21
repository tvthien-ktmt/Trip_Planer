-- prisma/migrations/20260721120002_drop_duplicate_checks/migration.sql
ALTER TABLE `Review` DROP CHECK `chk_review_rating`;
ALTER TABLE `Tour` DROP CHECK `chk_tour_discount`;
ALTER TABLE `UserPoints` DROP CHECK `chk_user_points`;
