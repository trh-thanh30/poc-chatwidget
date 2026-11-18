CREATE TYPE "public"."message_direction" AS ENUM('visitor', 'operator');--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"direction" "message_direction" NOT NULL,
	"content" text NOT NULL,
	"idempotency_key" uuid,
	"channel_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_content_length_check" CHECK (char_length(trim("messages"."content")) between 1 and 2000),
	CONSTRAINT "messages_direction_identity_check" CHECK (("messages"."direction" = 'visitor' and "messages"."idempotency_key" is not null) or ("messages"."direction" = 'operator' and "messages"."channel_message_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_widget_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."widget_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "messages_session_id_idempotency_key_unique" ON "messages" USING btree ("session_id","idempotency_key");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_channel_message_id_unique" ON "messages" USING btree ("channel_message_id");--> statement-breakpoint
CREATE INDEX "messages_session_id_created_at_idx" ON "messages" USING btree ("session_id","created_at");