/*
  Warnings:

  - You are about to drop the column `title` on the `Quiz` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Quiz` DROP COLUMN `title`,
    ADD COLUMN `marks` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Quiz_lessonId_idx` ON `Quiz`(`lessonId`);
