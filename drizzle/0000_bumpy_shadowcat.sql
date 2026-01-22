CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"refreshToken" text PRIMARY KEY NOT NULL,
	"expiry" timestamp with time zone NOT NULL,
	"userId" integer NOT NULL,
	CONSTRAINT "refresh_tokens_refreshToken_unique" UNIQUE("refreshToken")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(128) NOT NULL,
	"passwordHash" varchar(256) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"fullName" varchar(96),
	"profilePic" varchar(160),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;