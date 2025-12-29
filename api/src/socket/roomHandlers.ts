import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db } from "../database/db";
import { roomTable, userTable } from "../database/schema/tables";
import { eq, sql } from "drizzle-orm";
import {
  saveParticipants,
  getParticipants,
  checkRoomExists,
  deleteRoom,
  getCanvasHistory,
} from "../utils/redisHelpers";
export const registerRoomHandlers = (io: Server, socket: Socket) => {
  // create room handler
  socket.on(
    "createroom",
    async ({ roomName, userName, roomCode }, callback) => {
      try {
        const adminId = uuidv4();
        const [room] = await db
          .insert(roomTable)
          .values({
            id: roomCode,
            roomName,
            playersCount: 1,
            adminId,
          })
          .returning();

        const [admin] = await db
          .insert(userTable)
          .values({
            id: adminId,
            name: userName,
            roomId: roomCode,
          })
          .returning();

        socket.join(roomCode);
        await saveParticipants(roomCode, [{ userid: adminId, userName }]);
        callback?.({ success: true, data: { userId: adminId } });
        io.to(roomCode).emit(
          "updateParticipants",
          await getParticipants(roomCode)
        );
      } catch (error) {
        callback?.({ success: false, error: "Internal server error" });
      }
    }
  );

  socket.on("joinroom", async ({ roomCode, userName }, cb) => {
    try {
      const [room] = await db
        .select()
        .from(roomTable)
        .where(eq(roomTable.id, roomCode));
      if (!room) return cb?.({ success: false, error: "room does not exist" });

      const userId = uuidv4();
      await db
        .insert(userTable)
        .values({ id: userId, name: userName, roomId: roomCode });
      await db
        .update(roomTable)
        .set({ playersCount: sql`${roomTable.playersCount} + 1` })
        .where(eq(roomTable.id, roomCode));

      socket.join(roomCode);
      const isRoomExists = await checkRoomExists(roomCode);
      if (!isRoomExists) await saveParticipants(roomCode, []);
      const participants = await getParticipants(roomCode);
      participants.push({ userId, userName });
      const history = await getCanvasHistory(roomCode);
      cb?.({ success: true, data: { userId, canvasHistory: history } });
      io.to(roomCode).emit("updateParticipants", participants);
    } catch (e) {
      cb?.({ success: false, error: "Internal error" });
    }
  });

  socket.on("leaveroom", async ({ roomCode, userId }, cb) => {
    try {
      const [room] = await db
        .select()
        .from(roomTable)
        .where(eq(roomTable.id, roomCode));
      if (!room) {
        cb?.({ success: false, error: "room does not exists" });
        return;
      }

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

      if (!user) {
        cb?.({ success: false, error: "user does not exists in the room" });
        return;
      }

      if (room.playersCount == 1) {
        // this means this is the last user so when that user leave room should be deleted from the db.
        // If we delete the room , due to DELETE CASCADE user entry will also be removed, preventing us from deleting it explicitly
        await db.delete(roomTable).where(eq(roomTable.id, roomCode));
        await deleteRoom(roomCode); // clear memory
        socket.leave(roomCode);
        io.to(roomCode).emit("updateParticipants", []);
        return cb?.({
          success: true,
          data: {
            userId,
          },
        });
      }

      // playersCount is greater than 1 so delete the user explicitly

      await db.delete(userTable).where(eq(userTable.id, userId));
      await db
        .update(roomTable)
        .set({ playersCount: sql`${roomTable.playersCount} - 1` })
        .where(eq(roomTable.id, roomCode));

      socket.leave(roomCode);
      const isRoomExists = await checkRoomExists(roomCode);
      if (isRoomExists) {
        // Fetch the current list from Redis
        const currentParticipants = await getParticipants(roomCode);

        //Filter out the user who is leaving
        const updatedList = currentParticipants.filter(
          (p: any) => p.userId !== userId
        );

        if (updatedList.length > 0) {
          // Save the updated list back to Redis
          await saveParticipants(roomCode, updatedList);

          console.log("User left. Updated list in Redis:", updatedList);

          // Broadcast NEW list to the remaining players
          io.to(roomCode).emit("updateParticipants", updatedList);
        } else {
          // If the list is empty, delete the room entirely from Redis
          await deleteRoom(roomCode);
          console.log(`Room ${roomCode} deleted from Redis as it is empty.`);
        }
      }
      cb?.({
        success: true,
        data: {
          userId,
        },
      });
    } catch (error: any) {
      console.error(`error : `, error.cause);
      cb?.({
        success: false,
        error: `User deletion failed.`,
      });
    }
  });
};
