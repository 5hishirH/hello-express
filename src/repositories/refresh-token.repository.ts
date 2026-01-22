import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";

type NewToken = typeof schema.refreshTokens.$inferInsert;

export class RefreshTokenRepository {
  public db: NodePgDatabase<typeof schema>;
  constructor(private pool: Pool) {
    this.db = drizzle({
      client: this.pool,
      schema,
    });
  }

  async create(payload: NewToken) {
    await this.db.insert(schema.refreshTokens).values(payload);
  }

  async countByUserId(uid: number) {
    return this.db.$count(
      schema.refreshTokens,
      eq(schema.refreshTokens.userId, uid),
    );
  }

  async findByToken(token: string) {
    return this.db.query.refreshTokens.findFirst({
      where: eq(schema.refreshTokens.tokenHash, token),
    });
  }

  async deleteByToken(token: string) {
    await this.db
      .delete(schema.refreshTokens)
      .where(eq(schema.refreshTokens.tokenHash, token));
  }
}
