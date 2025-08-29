import express from "express"
import config from "./config"
import { createServer } from "http";
import { Server } from "socket.io"
import cors from "cors"
import roomRoutes from "./routes/roomRoutes";
const PORT = parseInt(config.env.port || "3000", 10);
import { v4 as uuidv4 } from "uuid";
import { userTable } from "./database/schema/tables";
import { roomTable } from "./database/schema/tables";
import { NewUser, NewRoom } from "./database/schema/tables";
import { db } from "./database/db";
import { DrizzleError, eq, sql } from "drizzle-orm";
import { error } from "console";
const app = express()

// middlewares
app.use(express.json())
app.use(cors(
  {
    origin: "*" // dev purposes 
  }
))
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: "*",   // or restrict to Expo's LAN URL
    methods: ["GET", "POST"]
  }
});

app.get("/ping", (_req, res) => {
  res.send("pong 🏓");
});

app.use("/room", roomRoutes)
io.on("connection", (socket) => {
  console.log(`websokcet connected , id : ${socket.id}`)



  socket.on('createroom', async ({ roomName, userName, roomCode }, callback) => {

    try {
      const adminId = uuidv4();

      const newRoom: NewRoom = {
        id: roomCode,
        roomName,
        playersCount: 1,
        adminId,
      };

      const [room] = await db.insert(roomTable).values(newRoom).returning();
      if (!room) {
        callback?.({ success: false, error: "Failed to create room" });
        return;
      }


      const newUser: NewUser = {
        id: adminId,
        name: userName,
        roomId: roomCode,
      };
      const [admin] = await db.insert(userTable).values(newUser).returning();
      if (!admin) {
        callback?.({ success: false, error: "Failed to create user" });
        return;
      }

      console.log(`socket : ${socket.id} has created room : ${roomCode}`);
      // increment the  playersCount
      await db.update(roomTable).set({ playersCount: sql`${roomTable.playersCount} + 1` }).where(eq(roomTable.id, roomCode));

      socket.join(roomCode);
      callback?.({
        success: true,
        data: {
          userId: admin.id
        }
      });

    } catch (error) {
      console.error("Error creating room:", error);
      callback?.({ success: false, error: "Internal server error" });
    }
  });

  socket.on("joinroom", async ({ roomCode, userName }, cb) => {
    try {
      // check if room with roomCode exists or other
      const [room] = await db.select().from(roomTable).where(eq(roomTable.id, roomCode))

      if (!room) {
        cb?.({ success: false, error: "room does not exists" });
      }
      console.log('user name is', userName)
      // create user 
      const userId = uuidv4()
      const newUser: NewUser = {
        id: userId,
        name: userName,
        roomId: roomCode,
      };
      const [user] = await db.insert(userTable).values(newUser).returning();
      if (!user) {
        cb?.({ success: false, error: "Failed to create user" });
        return;
      }

      // increment the  playersCount
      await db.update(roomTable).set({ playersCount: sql`${roomTable.playersCount} + 1` }).where(eq(roomTable.id, roomCode));

      console.log(`socket : ${socket.id} has joined the room : ${roomCode} `);
      cb?.({
        success: true, data: {
          userId: user.id
        }
      })

      socket.join(roomCode);

    } catch (error: any) {

      console.error(`error joining a room , `, error.cause)
      cb?.({ success: false, error: "Internal server error " });
    }

  })

  socket.on('leaveroom', async ({ roomCode, userId }, cb) => {

    try {

      const [room] = await db.select().from(roomTable).where(eq(roomTable.id, roomCode));
      if (!room) {
        cb?.({ success: false, error: 'room does not exists' });
      }

      const [user] = await db.select().from(userTable).where(eq(userTable.id, userId));

      if (!user) {
        cb?.({ success: false, error: 'user does not exists in the room' });
        return;
      }

      if (room.playersCount == 1) {
        // this means this is the last user so when that user leave room should be deleted from the db. 
        // If we delete the room , due to DELETE CASCADE user entry will also be removed, preventing us from deleting it explicitly
        await db.delete(roomTable).where(eq(roomTable.id, roomCode));
        cb?.({
          success: true,
          data: {
            userId
          }
        })
        return;
      }

      // playersCount is greater than 1 so delete the user explicitly

      await db.delete(userTable).where(eq(userTable.id, userId));

      cb?.({
        success: true,
        data: {
          userId
        }
      })

      socket.leave(roomCode)
    } catch (error: any) {
      console.error(`error : `, error.cause)
      cb?.({
        success: false,
        error: `User deletion failed.`
      })
    }
  })

  socket.on("disconnect", (reason) => {
    console.log(`❌ socket disconnected, id : ${socket.id}, reason: ${reason}`);
  });
  socket.on("clearCanvas", (roomId) => {
    socket.to(roomId).emit('clearCanvas');
  })
  socket.on("sendmessage", ({ roomId, message }) => {
    socket.to(roomId).emit('receivemessage', message);
  })
  socket.on("drawStroke", (points: { x: number; y: number }[], tool: "pen" | "eraser", roomId: string) => {
    // broadcast the stroke to all other clients
    socket.to(roomId).emit("receive", points, tool);

  });
})


httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on http://0.0.0.0:${PORT}`);
});

