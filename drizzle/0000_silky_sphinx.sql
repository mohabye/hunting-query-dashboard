CREATE TABLE `data_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('ETW','Sysmon','Network','Registry','File') NOT NULL,
	`description` text,
	`provider` varchar(255),
	`eventIds` json NOT NULL DEFAULT (json_array()),
	`enabled` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `data_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hunt_engagements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`status` enum('active','completed','paused') NOT NULL DEFAULT 'active',
	`severity` enum('critical','high','medium','low') NOT NULL,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`proceduresCovered` json NOT NULL DEFAULT (json_array()),
	`totalQueries` int NOT NULL DEFAULT 0,
	`detectionsFound` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hunt_engagements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hunting_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`techniqueId` varchar(50) NOT NULL,
	`techniqueName` varchar(255) NOT NULL,
	`procedure` text,
	`threatLevel` enum('critical','high','medium','low') NOT NULL,
	`dataSources` json NOT NULL DEFAULT (json_array()),
	`querySyntax` text,
	`eventIds` json NOT NULL DEFAULT (json_array()),
	`enabled` boolean NOT NULL DEFAULT true,
	`detections` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hunting_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
