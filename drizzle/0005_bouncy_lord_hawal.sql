ALTER TABLE "refresh_tokens" RENAME COLUMN "token" TO "tokenHash";--> statement-breakpoint
ALTER TABLE "refresh_tokens" DROP CONSTRAINT "refresh_tokens_token_unique";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_tokenHash_unique" UNIQUE("tokenHash");