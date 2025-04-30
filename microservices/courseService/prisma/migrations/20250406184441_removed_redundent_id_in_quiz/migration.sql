/*
  Warnings:

  - You are about to drop the column `quizId` on the `Question` table. All the data in the column will be lost.
  - The primary key for the `Quiz` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Quiz` table. All the data in the column will be lost.
  - Added the required column `lessonId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_quizId_fkey`;

-- DropIndex
DROP INDEX `Question_quizId_idx` ON `Question`;

-- AlterTable
ALTER TABLE `Question` DROP COLUMN `quizId`,
    ADD COLUMN `lessonId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Quiz` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`lessonId`);

-- CreateIndex
CREATE INDEX `Question_lessonId_idx` ON `Question`(`lessonId`);

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_lessonId_fkey` FOREIGN KEY (`lessonId`) REFERENCES `Quiz`(`lessonId`) ON DELETE RESTRICT ON UPDATE CASCADE;
