/*
  Warnings:

  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Rating` DROP FOREIGN KEY `Rating_courseId_fkey`;

-- DropTable
DROP TABLE `Rating`;
