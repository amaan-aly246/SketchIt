CREATE TABLE "rooms" (
	"id" varchar(4) PRIMARY KEY NOT NULL,
	"admin" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"room_name" text NOT NULL,
	"players_count" integer NOT NULL
);
--> statement-breakpoint
DROP TABLE "posts" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;