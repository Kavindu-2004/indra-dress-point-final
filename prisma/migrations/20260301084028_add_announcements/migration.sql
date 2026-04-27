/*
  Warnings:

  - The primary key for the `Announcement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `Announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Announcement` DROP PRIMARY KEY,
    DROP COLUMN `active`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `page` VARCHAR(191) NOT NULL DEFAULT 'home',
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
