CREATE TABLE `team_memories` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`author_kin_id` text NOT NULL,
	`content` text NOT NULL,
	`embedding` blob,
	`category` text NOT NULL,
	`subject` text,
	`importance` real,
	`retrieval_count` integer DEFAULT 0 NOT NULL,
	`last_retrieved_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_kin_id`) REFERENCES `kins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_team_memories_team` ON `team_memories` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_team_memories_team_cat` ON `team_memories` (`team_id`,`category`);