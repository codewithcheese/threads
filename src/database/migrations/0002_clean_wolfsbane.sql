ALTER TABLE `notePages` ADD `pageSlug` text NOT NULL;--> statement-breakpoint
CREATE INDEX `pageSlugIndex` ON `notePages` (`pageSlug`);