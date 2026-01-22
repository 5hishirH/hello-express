ALTER TABLE "refresh_tokens" RENAME COLUMN "refreshToken" TO "token";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_refreshToken_unique";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "updatedAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "createdAt" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "updatedAt" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token");