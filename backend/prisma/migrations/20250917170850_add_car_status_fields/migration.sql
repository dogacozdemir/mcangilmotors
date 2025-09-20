-- AlterTable
ALTER TABLE `cars` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'available',
ADD COLUMN `sold_at` DATETIME(3) NULL,
ADD COLUMN `sold_price` DECIMAL(12, 2) NULL;

