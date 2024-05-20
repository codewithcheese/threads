ALTER TABLE `pages` ADD `slug` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);