ALTER TABLE `tasks` ADD `concurrency_group` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `concurrency_max` integer;--> statement-breakpoint
ALTER TABLE `tasks` ADD `queued_at` integer;--> statement-breakpoint
CREATE INDEX `idx_tasks_concurrency_group` ON `tasks` (`concurrency_group`);