/*
  Warnings:

  - You are about to drop the column `notes` on the `Lesson` table. All the data in the column will be lost.
  - The primary key for the `Question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `lessonId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `marks` on the `Quiz` table. All the data in the column will be lost.
  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `difficulty` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Quiz` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Quiz` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `title` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Option` DROP FOREIGN KEY `Option_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `Quiz` DROP FOREIGN KEY `Quiz_lessonId_fkey`;

-- DropIndex
DROP INDEX `Question_lessonId_idx` ON `Question`;

-- DropIndex
DROP INDEX `Quiz_lessonId_key` ON `Quiz`;

-- AlterTable
ALTER TABLE `Lesson` DROP COLUMN `notes`;

-- AlterTable
ALTER TABLE `Question` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `lessonId`,
    DROP COLUMN `text`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `correctAnswer` TEXT NULL,
    ADD COLUMN `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    ADD COLUMN `explanation` TEXT NULL,
    ADD COLUMN `options` JSON NULL,
    ADD COLUMN `question` VARCHAR(191) NOT NULL,
    ADD COLUMN `quizId` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER') NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Quiz` DROP PRIMARY KEY,
    DROP COLUMN `marks`,
    ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `duration` INTEGER NOT NULL,
    ADD COLUMN `id` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `Option`;

-- CreateTable
CREATE TABLE `Assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lessonId` INTEGER NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignmentId` INTEGER NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Submission_assignmentId_idx`(`assignmentId`),
    INDEX `Submission_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Studynote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `lessonId` INTEGER NOT NULL,
    `description` TEXT NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `Quiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Studynote` ADD CONSTRAINT `Studynote_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
