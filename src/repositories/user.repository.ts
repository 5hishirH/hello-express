import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { UpdateUserInput } from "../validators/user.validator.js";
import { UserDto } from "../dtos/index.js";

interface UpdateDto extends UpdateUserInput {
  profilePic?: string;
}

export class UserRepository {
  private db: NodePgDatabase<typeof schema>;
  constructor(private pool: Pool) {
    this.db = drizzle({
      client: this.pool,
      schema,
    });
  }

  async create(u: schema.NewUser): Promise<UserDto | undefined> {
    const [user] = await this.db
      .insert(schema.users)
      .values(u)
      .returning(schema.userColumns);

    return user;
  }

  async findByEmail(e: schema.User["email"]) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, e),
    });
  }

  async userExists(email: string): Promise<boolean> {
    const [result] = await this.db
      .select({ empty: sql`1` })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    return !!result;
  }

  async findById(uid: number) {
    const [user] = await this.db
      .select(schema.userColumns)
      .from(schema.users)
      .where(eq(schema.users.id, uid))
      .limit(1);

    return user;
  }

  async updateOne(uid: schema.User["id"], updateInput: UpdateDto) {
    const updatedAt = new Date();

    const [user] = await this.db
      .update(schema.users)
      .set({
        ...updateInput,
        updatedAt,
      })
      .where(eq(schema.users.id, uid))
      .returning(schema.userColumns);

    return user;
  }
}
