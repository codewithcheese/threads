DROP INDEX IF EXISTS `labelSlugIndex`;--> statement-breakpoint
CREATE UNIQUE INDEX `noteLabels_labelSlug_unique` ON `noteLabels` (`labelSlug`);