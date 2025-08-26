import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { pgTable, varchar, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

export const roomTable = pgTable("rooms", {
  id: varchar("id", { length: 4 }).primaryKey(), // short room code
  admin: text("admin").notNull(),                // who created the room
  createdAt: timestamp("created_at").notNull().defaultNow(),
  roomName: text("room_name").notNull(),
  playersCount: integer("players_count").notNull(),
});

export const userTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  roomId: varchar("room_id", { length: 4 }).references(() => roomTable.id),
})

export const roomRelations = relations(roomTable, ({ many }) => ({
  users: many(userTable),
}));

export const userRelations = relations(userTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [userTable.id],
    references: [roomTable.id],
  }),
}));

export type Room = InferSelectModel<typeof roomTable>; // type when selecting row 
export type NewRoom = InferInsertModel<typeof roomTable>; // type when writing row, it makes colm like createdAt optinal because 
// it will be populated automatically.  
export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;
