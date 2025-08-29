CREATE TABLE "rooms" (
	"id" varchar(4) PRIMARY KEY NOT NULL,
	"admin_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"room_name" text NOT NULL,
	"players_count" integer NOT NULL,
	CONSTRAINT "rooms_admin_id_unique" UNIQUE("admin_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"room_id" varchar(4)
);
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;