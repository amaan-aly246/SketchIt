import express from "express"
import config from "./config"
import { createServer } from "http";
import { Server } from "socket.io"
import cors from "cors"
const PORT = parseInt(config.env.port || "3000", 10);

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
io.on("connection", (socket) => {
  console.log(`websokcet connected , id : ${socket.id}`)

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`socket : ${socket.id} has joined the room : ${roomId} `);
    // console all the curr sockets in the room : roomId

  })

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId)
    console.log(`socket: ${socket.id} has left the room: ${roomId} `);
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

