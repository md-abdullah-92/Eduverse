/*
  Warnings:

  - You are about to alter the column `difficulty` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to alter the column `type` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `Question` MODIFY `difficulty` VARCHAR(191) NOT NULL,
    MODIFY `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Quiz` MODIFY `description` TEXT NOT NULL;
