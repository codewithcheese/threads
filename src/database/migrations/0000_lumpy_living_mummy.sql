CREATE TABLE `chatMessages` (
	`id` text NOT NULL,
	`chatId` text NOT NULL,
	`sender` text,
	`recipients` text DEFAULT '[]',
	`role` text NOT NULL,
	`content` text,
	`data` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`chatId`, `id`),
	FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`pageSlug` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `chatbots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`defaultModelId` text,
	`messages` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`defaultModelId`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`serviceId` text NOT NULL,
	`baseURL` text NOT NULL,
	`apiKey` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`keyId` text NOT NULL,
	`name` text NOT NULL,
	`visible` integer NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`keyId`) REFERENCES `keys`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `noteLabels` (
	`noteId` text NOT NULL,
	`label` text NOT NULL,
	`labelSlug` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY(`label`, `noteId`),
	FOREIGN KEY (`noteId`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`labels` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chatbots_name_unique` ON `chatbots` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `labels_slug_unique` ON `labels` (`slug`);--> statement-breakpoint
CREATE INDEX `keyIdIndex` ON `models` (`keyId`);--> statement-breakpoint
CREATE INDEX `labelSlugIndex` ON `noteLabels` (`labelSlug`);