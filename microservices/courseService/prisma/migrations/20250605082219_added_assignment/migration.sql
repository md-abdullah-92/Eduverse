/*
  Warnings:

  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lessonId` on the `Quiz` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lesson_id]` on the table `Quiz` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `difficulty` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question_text` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lesson_id` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_lessonId_fkey`;

-- DropForeignKey
ALTER TABLE `Quiz` DROP FOREIGN KEY `Quiz_lessonId_fkey`;

-- DropIndex
DROP INDEX `Quiz_lessonId_key` ON `Quiz`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `text`,
    ADD COLUMN `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    ADD COLUMN `explanation` VARCHAR(191) NULL,
    ADD COLUMN `question_text` VARCHAR(191) NOT NULL,
    ADD COLUMN `type` ENUM('MCQ', 'CQ') NOT NULL;

-- AlterTable
ALTER TABLE `Quiz` DROP PRIMARY KEY,
    DROP COLUMN `lessonId`,
    ADD COLUMN `lesson_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`lesson_id`);

-- CreateTable
CREATE TABLE `Assignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lessonId` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Assignment_lessonId_key`(`lessonId`),
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

-- CreateIndex
CREATE UNIQUE INDEX `Quiz_lesson_id_key` ON `Quiz`(`lesson_id`);

-- AddForeignKey
ALTER TABLE `Quiz` ADD CONSTRAINT `Quiz_lesson_id_fkey` FOREIGN KEY (`lesson_id`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Quiz`(`lesson_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Lesson`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_assignmentId_fkey` FOREIGN KEY (`assignmentId`) REFERENCES `Assignment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
