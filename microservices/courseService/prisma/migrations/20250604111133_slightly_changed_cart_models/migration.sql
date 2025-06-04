/*
  Warnings:

  - The primary key for the `Cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `cartId` on the `CartItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,courseId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_cartId_fkey`;

-- DropIndex
DROP INDEX `Cart_studentId_idx` ON `Cart`;

-- DropIndex
DROP INDEX `Cart_studentId_key` ON `Cart`;

-- DropIndex
DROP INDEX `CartItem_cartId_courseId_key` ON `CartItem`;

-- DropIndex
DROP INDEX `CartItem_cartId_idx` ON `CartItem`;

-- AlterTable
ALTER TABLE `Cart` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`studentId`);

-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `cartId`,
    ADD COLUMN `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `studentId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `CartItem_studentId_idx` ON `CartItem`(`studentId`);

-- CreateIndex
CREATE UNIQUE INDEX `CartItem_studentId_courseId_key` ON `CartItem`(`studentId`, `courseId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Cart`(`studentId`) ON DELETE CASCADE ON UPDATE CASCADE;
