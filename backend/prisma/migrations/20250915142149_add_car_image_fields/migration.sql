-- AlterTable
ALTER TABLE `car_images` ADD COLUMN `alt_text` VARCHAR(255) NULL,
    ADD COLUMN `sort_order` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `cars` ADD COLUMN `cover_image` VARCHAR(500) NULL;
