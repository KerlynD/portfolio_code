CREATE TABLE `communities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ext_id` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`description` text DEFAULT '' NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_ext_id_unique` ON `communities` (`ext_id`);--> statement-breakpoint
CREATE TABLE `config` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ext_id` text NOT NULL,
	`company` text NOT NULL,
	`role` text NOT NULL,
	`team` text DEFAULT '' NOT NULL,
	`period` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`logo` text,
	`logo_fallback` text DEFAULT '' NOT NULL,
	`logo_background` text,
	`tags` text NOT NULL,
	`highlights` text NOT NULL,
	`responsibilities` text NOT NULL,
	`current` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `experiences_ext_id_unique` ON `experiences` (`ext_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`kind` text DEFAULT 'Post' NOT NULL,
	`title` text NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`cover` text,
	`rating` integer,
	`published` integer DEFAULT true NOT NULL,
	`post_date` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ext_id` text NOT NULL,
	`name` text NOT NULL,
	`short_description` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`tags` text NOT NULL,
	`image` text,
	`links` text NOT NULL,
	`confidential` integer DEFAULT false NOT NULL,
	`hackathon` text,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_ext_id_unique` ON `projects` (`ext_id`);