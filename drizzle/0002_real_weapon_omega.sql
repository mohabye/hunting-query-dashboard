CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int,
	`changes` json NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `permissions_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `query_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`convertedQuery` text NOT NULL,
	`convertedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `query_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `query_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryId` int NOT NULL,
	`version` int NOT NULL,
	`content` text NOT NULL,
	`changedBy` int NOT NULL,
	`changeDescription` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `query_versions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roleId` int NOT NULL,
	`permissionId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `role_permissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_roles_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `data_sources` MODIFY COLUMN `eventIds` json NOT NULL;--> statement-breakpoint
ALTER TABLE `hunt_engagements` MODIFY COLUMN `proceduresCovered` json NOT NULL;--> statement-breakpoint
ALTER TABLE `hunting_queries` MODIFY COLUMN `dataSources` json NOT NULL;--> statement-breakpoint
ALTER TABLE `hunting_queries` MODIFY COLUMN `eventIds` json NOT NULL;