ALTER TABLE `data_sources` MODIFY COLUMN `enabled` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `hunting_queries` MODIFY COLUMN `enabled` boolean NOT NULL DEFAULT true;