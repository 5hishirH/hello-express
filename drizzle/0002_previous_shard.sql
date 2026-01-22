ALTER TABLE "refresh_tokens" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "refresh_tokens" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "refresh_tokens" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "fullName" TO "full_name";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "profilePic" TO "profile_pic";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_userId_users_id_fk";
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;