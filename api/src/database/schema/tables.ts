import { pgTable, uuid, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  roomId: varchar("room_id", { length: 4 }).references(() => roomTable.id, { onDelete: "cascade" }),
});

export const roomTable = pgTable("rooms", {
  id: varchar("id", { length: 4 }).primaryKey(),
  adminId: uuid("admin_id").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  roomName: text("room_name").notNull(),
  playersCount: integer("players_count").notNull(),
});


export type Room = InferSelectModel<typeof roomTable>; // type when selecting row 
export type NewRoom = InferInsertModel<typeof roomTable>; // type when writing row, it makes colm like createdAt optinal because 
// it will be populated automatically.  
export type User = InferSelectModel<typeof userTable>;
export type NewUser = InferInsertModel<typeof userTable>;
