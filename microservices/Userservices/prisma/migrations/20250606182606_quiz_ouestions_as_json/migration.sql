-- DropForeignKey
ALTER TABLE `Question` DROP FOREIGN KEY `Question_quizId_fkey`;

-- DropIndex
DROP INDEX `Question_quizId_fkey` ON `Question`;

-- AlterTable
ALTER TABLE `Quiz` ADD COLUMN `questions` JSON NULL;
