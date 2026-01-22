import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.js";
import { eq } from "drizzle-orm";

export class UserRepository {
  public db: NodePgDatabase<typeof schema>;
  constructor(private pool: Pool) {
    this.db = drizzle({
      client: this.pool,
      schema,
    });
  }

  async create(u: schema.NewUser) {
    await this.db.insert(schema.users).values(u);
  }

  async findByEmail(e: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, e),
    });
  }
}
