-- CreateTable
CREATE TABLE `Quizresults` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `marks` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,
    `lessonId` INTEGER NOT NULL,
    `courseId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnsweredQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `correctAnswer` TEXT NULL,
    `options` JSON NULL,
    `explanation` TEXT NULL,
    `difficulty` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `quizId` VARCHAR(191) NULL,
    `quizResultId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Quizresults` ADD CONSTRAINT `Quizresults_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `StudentProfile`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnsweredQuestion` ADD CONSTRAINT `AnsweredQuestion_quizResultId_fkey` FOREIGN KEY (`quizResultId`) REFERENCES `Quizresults`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
