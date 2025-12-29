import { relations } from "drizzle-orm";
import { userTable, roomTable } from "./tables";

export const roomRelations = relations(roomTable, ({ many }) => ({
  users: many(userTable),
}));

export const userRelations = relations(userTable, ({ one }) => ({
  room: one(roomTable, {
    fields: [userTable.roomId],
    references: [roomTable.id],
  }),
}));
