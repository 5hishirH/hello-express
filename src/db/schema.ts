import { getTableColumns, relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  serial,
  varchar,
  integer,
  text,
  timestamp,
  json,
  index,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "user"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
};

export const users = pgTable("users", {
  id: serial().primaryKey(),
  email: varchar({ length: 128 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  role: userRole().notNull().default("user"),
  fullName: varchar("full_name", { length: 96 }),
  profilePic: varchar("profile_pic", { length: 160 }),
  ...timestamps,
});

export const refreshTokens = pgTable("refresh_tokens", {
  tokenHash: text().unique().primaryKey(),
  expiry: timestamp({ withTimezone: true }).notNull(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  ...timestamps,
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar().primaryKey().notNull(),
    sess: json().notNull(),
    expire: timestamp({ precision: 6 }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export const { passwordHash: _, ...userColumns } = getTableColumns(users);
