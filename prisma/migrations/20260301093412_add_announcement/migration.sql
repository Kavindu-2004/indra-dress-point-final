/*
  Warnings:

  - The primary key for the `Announcement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isActive` on the `Announcement` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Announcement` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `Announcement` DROP PRIMARY KEY,
    DROP COLUMN `isActive`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
