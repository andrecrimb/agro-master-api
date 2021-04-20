/*
  Warnings:

  - You are about to drop the column `propertyId` on the `Property` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Property` DROP FOREIGN KEY `property_ibfk_1`;

-- AlterTable
ALTER TABLE `Property` DROP COLUMN `propertyId`;

-- CreateTable
CREATE TABLE `OwnerProperty` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `propertyId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OwnerProperty` ADD FOREIGN KEY (`propertyId`) REFERENCES `Property`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
