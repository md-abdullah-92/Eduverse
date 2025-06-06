/*
  Warnings:

  - You are about to drop the `Option` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Option` DROP FOREIGN KEY `Option_questionId_fkey`;

-- AlterTable
ALTER TABLE `Question` ADD COLUMN `correctAnswer` VARCHAR(191) NOT NULL,
    ADD COLUMN `options` JSON NULL;

-- DropTable
DROP TABLE `Option`;
