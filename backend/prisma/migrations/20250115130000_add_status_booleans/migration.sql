-- Add separate boolean fields for status tracking
-- This allows cars to have multiple statuses simultaneously (e.g., both sold and incoming)

-- Add is_sold boolean field
ALTER TABLE `cars` ADD COLUMN `is_sold` BOOLEAN DEFAULT FALSE AFTER `status`;

-- Add is_incoming boolean field  
ALTER TABLE `cars` ADD COLUMN `is_incoming` BOOLEAN DEFAULT FALSE AFTER `is_sold`;

-- Add is_reserved boolean field
ALTER TABLE `cars` ADD COLUMN `is_reserved` BOOLEAN DEFAULT FALSE AFTER `is_incoming`;

-- Add indexes for better performance
CREATE INDEX `idx_cars_is_sold` ON `cars` (`is_sold`);
CREATE INDEX `idx_cars_is_incoming` ON `cars` (`is_incoming`);
CREATE INDEX `idx_cars_is_reserved` ON `cars` (`is_reserved`);

-- Update existing records based on current status
UPDATE `cars` SET `is_sold` = TRUE WHERE `status` = 'sold';
UPDATE `cars` SET `is_incoming` = TRUE WHERE `status` = 'incoming';
UPDATE `cars` SET `is_reserved` = TRUE WHERE `status` = 'reserved';

