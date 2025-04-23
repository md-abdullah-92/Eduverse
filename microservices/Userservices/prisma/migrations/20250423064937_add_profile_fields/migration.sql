-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `coverPhoto` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `teacherprofile` ADD COLUMN `coverPhoto` VARCHAR(191) NULL,
    ADD COLUMN `profilePhoto` VARCHAR(191) NULL,
    ADD COLUMN `rating` DOUBLE NULL;
