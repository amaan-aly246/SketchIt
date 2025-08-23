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
  socket.on("disconnect", (reason) => {
    console.log(`❌ socket disconnected, id : ${socket.id}, reason: ${reason}`);
  });
})


httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on http://0.0.0.0:${PORT}`);
});

