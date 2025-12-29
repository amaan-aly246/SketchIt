import express from "express";
import { createServer } from "http";
import cors from "cors";
import config from "./config";
import roomRoutes from "./routes/roomRoutes";
import { initSocket } from "./socket";

const app = express();
const PORT = parseInt(config.env.port, 10);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/room", roomRoutes);

app.get("/ping", (_, res) => res.send("pong 🏓"));

const httpServer = createServer(app);

// Initialize Sockets
initSocket(httpServer);

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// OLD CODE, SHOULD BE REMOVED LATER
// import express from "express";
// import config from "./config";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import cors from "cors";
// import roomRoutes from "./routes/roomRoutes";
// const PORT = parseInt(config.env.port, 10);
// import { v4 as uuidv4 } from "uuid";
// import { userTable } from "./database/schema/tables";
// import { roomTable } from "./database/schema/tables";
// import { NewUser, NewRoom } from "./database/schema/tables";
// import { checkWord } from "./utils/checkWord";
// import { db } from "./database/db";
// import { eq, sql } from "drizzle-orm";
// const app = express();

// // middlewares
// app.use(express.json());
// app.use(
//   cors({
//     origin: "*", // dev purposes
//   })
// );
// const httpServer = createServer(app);

// const io = new Server(httpServer, {
//   cors: {
//     origin: "*", // all
//     methods: ["GET", "POST"],
//   },
// });

// app.get("/ping", (_req, res) => {
//   res.send("pong 🏓");
// });

// app.use("/room", roomRoutes);
// const activeRooms = new Map();
// io.on("connection", (socket) => {
//   console.log(`websokcet connected , id : ${socket.id}`);

//   socket.on(
//     "createroom",
//     async ({ roomName, userName, roomCode }, callback) => {
//       try {
//         const adminId = uuidv4();

//         const newRoom: NewRoom = {
//           id: roomCode,
//           roomName,
//           playersCount: 1,
//           adminId,
//         };

//         const [room] = await db.insert(roomTable).values(newRoom).returning();
//         if (!room) {
//           callback?.({ success: false, error: "Failed to create room" });
//           return;
//         }

//         const newUser: NewUser = {
//           id: adminId,
//           name: userName,
//           roomId: roomCode,
//         };
//         const [admin] = await db.insert(userTable).values(newUser).returning();
//         if (!admin) {
//           callback?.({ success: false, error: "Failed to create user" });
//           return;
//         }

//         console.log(`socket : ${socket.id} has created room : ${roomCode}`);

//         socket.join(roomCode);
//         callback?.({
//           success: true,
//           data: {
//             userId: admin.id,
//           },
//         });

//         if (!activeRooms.has(roomCode)) {
//           activeRooms.set(roomCode, []);
//         }
//         const participants = activeRooms.get(roomCode);
//         participants.push({ adminId, userName });
//         io.to(roomCode).emit("updateParticipants", participants);
//       } catch (error) {
//         console.error("Error creating room:", error);
//         callback?.({ success: false, error: "Internal server error" });
//       }
//     }
//   );

//   socket.on("joinroom", async ({ roomCode, userName }, cb) => {
//     try {
//       // check if room with roomCode exists or other
//       const [room] = await db
//         .select()
//         .from(roomTable)
//         .where(eq(roomTable.id, roomCode));

//       if (!room) {
//         cb?.({ success: false, error: "room does not exists" });
//         return;
//       }
//       console.log("user name is", userName);
//       // create user
//       const userId = uuidv4();
//       const newUser: NewUser = {
//         id: userId,
//         name: userName,
//         roomId: roomCode,
//       };
//       const [user] = await db.insert(userTable).values(newUser).returning();
//       if (!user) {
//         cb?.({ success: false, error: "Failed to create user" });
//         return;
//       }

//       // increment the  playersCount
//       await db
//         .update(roomTable)
//         .set({ playersCount: sql`${roomTable.playersCount} + 1` })
//         .where(eq(roomTable.id, roomCode));

//       console.log(`socket : ${socket.id} has joined the room : ${roomCode} `);
//       cb?.({
//         success: true,
//         data: {
//           userId: user.id,
//         },
//       });

//       socket.join(roomCode);
//       if (!activeRooms.has(roomCode)) {
//         activeRooms.set(roomCode, []);
//       }
//       const participants = activeRooms.get(roomCode);
//       participants.push({ userId, userName });
//       console.log("from server ", participants);
//       io.to(roomCode).emit("updateParticipants", participants);
//     } catch (error: any) {
//       console.error(`error joining a room , `, error.cause);
//       cb?.({ success: false, error: "Internal server error " });
//     }
//   });

//   socket.on("leaveroom", async ({ roomCode, userId }, cb) => {
//     try {
//       const [room] = await db
//         .select()
//         .from(roomTable)
//         .where(eq(roomTable.id, roomCode));
//       if (!room) {
//         cb?.({ success: false, error: "room does not exists" });
//         return;
//       }

//       const [user] = await db
//         .select()
//         .from(userTable)
//         .where(eq(userTable.id, userId));

//       if (!user) {
//         cb?.({ success: false, error: "user does not exists in the room" });
//         return;
//       }

//       if (room.playersCount == 1) {
//         // this means this is the last user so when that user leave room should be deleted from the db.
//         // If we delete the room , due to DELETE CASCADE user entry will also be removed, preventing us from deleting it explicitly
//         await db.delete(roomTable).where(eq(roomTable.id, roomCode));
//         activeRooms.delete(roomCode); // Clear memory
//         socket.leave(roomCode);
//         io.to(roomCode).emit("updateParticipants", []);
//         return cb?.({
//           success: true,
//           data: {
//             userId,
//           },
//         });
//       }

//       // playersCount is greater than 1 so delete the user explicitly

//       await db.delete(userTable).where(eq(userTable.id, userId));
//       await db
//         .update(roomTable)
//         .set({ playersCount: sql`${roomTable.playersCount} - 1` })
//         .where(eq(roomTable.id, roomCode));

//       socket.leave(roomCode);
//       if (activeRooms.has(roomCode)) {
//         const updatedList = activeRooms
//           .get(roomCode)
//           .filter((p: any) => p.userId !== userId);
//         activeRooms.set(roomCode, updatedList);
//         console.log("leave room , particants list from server", updatedList);
//         // Broadcast NEW list to the remaining players
//         io.to(roomCode).emit("updateParticipants", updatedList);
//       }
//       cb?.({
//         success: true,
//         data: {
//           userId,
//         },
//       });
//     } catch (error: any) {
//       console.error(`error : `, error.cause);
//       cb?.({
//         success: false,
//         error: `User deletion failed.`,
//       });
//     }
//   });

//   socket.on("disconnect", (reason) => {
//     console.log(`❌ socket disconnected, id : ${socket.id}, reason: ${reason}`);
//   });
//   socket.on("clearcanvas", (roomId) => {
//     socket.to(roomId).emit("clearcanvas");
//   });
//   socket.on("sendmessage", async ({ roomCode, message, userName, userId }) => {
//     console.log(`message in server `, message);
//     let flag = await checkWord(message);
//     const data = {
//       message,
//       authorId: userId,
//       authorName: userName,
//       isCorrect: flag,
//     };
//     if (flag === true) {
//       // correct word
//       // hide the word for rest of the users
//       socket
//         .to(roomCode)
//         .emit("receivemessage", { ...data, message: "hidden" });
//       // don't hide the message for the user
//       socket.emit("receivemessage", data);
//     } else {
//       // not a correct word
//       io.to(roomCode).emit("receivemessage", data); // send messg to all the users in the room
//     }
//   });
//   socket.on(
//     "drawstroke",
//     (
//       points: { x: number; y: number }[],
//       tool: "pen" | "eraser",
//       roomCode: string
//     ) => {
//       // broadcast the stroke to all other clients
//       socket.to(roomCode).emit("receive", points, tool);
//     }
//   );
// });

// httpServer.listen(PORT, "0.0.0.0", () => {
//   console.log(`server running on http://0.0.0.0:${PORT}`);
// });
