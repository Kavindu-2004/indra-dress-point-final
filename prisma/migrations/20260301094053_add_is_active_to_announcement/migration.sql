/*
  Warnings:

  - You are about to drop the column `active` on the `Announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Announcement` DROP COLUMN `active`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;
