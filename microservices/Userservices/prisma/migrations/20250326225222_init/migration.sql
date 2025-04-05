/*
  Warnings:

  - The values [ADMIN] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `phoneNumber` VARCHAR(191) NULL,
    ADD COLUMN `profileImage` VARCHAR(191) NULL,
    MODIFY `role` ENUM('STUDENT', 'TEACHER') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `StudentProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `educationLevel` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `guardianName` VARCHAR(191) NOT NULL,
    `guardianPhone` VARCHAR(191) NOT NULL,
    `guardianEmail` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeacherProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `education` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `experience` INTEGER NOT NULL,
    `institution` VARCHAR(191) NULL,
    `certifications` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeacherProfile_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
