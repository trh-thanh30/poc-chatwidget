CREATE TABLE "widget_allowed_origins" (
	"widget_id" text NOT NULL,
	"origin" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "widget_allowed_origins_widget_id_origin_pk" PRIMARY KEY("widget_id","origin")
);
--> statement-breakpoint
CREATE TABLE "widget_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"widget_id" text NOT NULL,
	"origin" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "widgets" (
	"id" text PRIMARY KEY NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "widget_allowed_origins" ADD CONSTRAINT "widget_allowed_origins_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "widget_sessions" ADD CONSTRAINT "widget_sessions_widget_id_widgets_id_fk" FOREIGN KEY ("widget_id") REFERENCES "public"."widgets"("id") ON DELETE cascade ON UPDATE no action;