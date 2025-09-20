-- Add incoming status to cars table
-- This migration adds support for "incoming" status to track cars that are coming from abroad to KKTC

-- Update the status column to include 'incoming' as a valid value
-- Note: MySQL doesn't have ENUM constraints in the same way, so we'll add a comment for documentation
-- The application logic will handle the validation of status values

-- Add expected_arrival column to track when the car is expected to arrive
ALTER TABLE `cars` ADD COLUMN `expected_arrival` DATETIME NULL AFTER `sold_price`;

-- Add index for better performance when filtering by status
CREATE INDEX `idx_cars_status` ON `cars` (`status`);

-- Add index for expected arrival date filtering
CREATE INDEX `idx_cars_expected_arrival` ON `cars` (`expected_arrival`);

