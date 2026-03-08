CREATE TABLE `team_knowledge_chunks` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`team_id` text NOT NULL,
	`content` text NOT NULL,
	`embedding` blob,
	`position` integer NOT NULL,
	`token_count` integer NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `team_knowledge_sources`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_team_knowledge_chunks_team` ON `team_knowledge_chunks` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_team_knowledge_chunks_source` ON `team_knowledge_chunks` (`source_id`);--> statement-breakpoint
CREATE TABLE `team_knowledge_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`error_message` text,
	`original_filename` text,
	`mime_type` text,
	`stored_path` text,
	`source_url` text,
	`raw_content` text,
	`chunk_count` integer DEFAULT 0 NOT NULL,
	`token_count` integer DEFAULT 0 NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_team_knowledge_sources_team` ON `team_knowledge_sources` (`team_id`);