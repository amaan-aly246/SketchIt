import { Request, Response } from "express";
import { db } from "../database/db";
import { NewRoom, NewUser, roomTable, userTable } from "../database/schema/tables";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {

    const { name, roomCode, roomName } = req.body;

    const newRoom: NewRoom = {
      adminId: uuidv4(),
      roomName,
      playersCount: 1,
      id: roomCode,
    }

    const [room] = await db.insert(roomTable).values(newRoom).returning();

    if (!room) {
      res.status(500).send(`Failed to create room`);
      return;
    }
    // create admin user with the room-id 
    const newuser: NewUser = {
      id: room.adminId,
      name,
      roomId: roomCode
    }
    const [admin] = await db.insert(userTable).values(newuser).returning();

    if (!admin) {
      res.status(500).send(`Failed to create user`);
      return
    }

    res.status(201).json({
      success: true,
      data: room,
    })

  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
}

const deleteRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.body
    const [deletedRoomId] = await db.delete(roomTable).where(eq(roomTable.id, roomId)).returning({ id: roomTable.id });

    res.status(200).json({
      success: true,
      data: deletedRoomId
    })
  } catch (error) {
    console.log(`Error creating room: `, error)
    res.status(500).json({
      success: false,
      error: `Failed to create room`
    })
  }
}

const joinRoom = async (req: Request, res: Response) => {
  try {
    const { userName, roomCode } = req.body

    if (!roomCode || !userName) {
      res.status(400).json({ error: `room code and user name are required` })
      return;
    }

    const [room] = await db.select().from(roomTable).where(eq(roomTable.id, roomCode));

    if (!room) {
      res.send(404).json({ error: `room with code ${roomCode} does not exist!` })
      return;
    }

    // update playersCount
    await db.update(roomTable)
      .set({ playersCount: sql`${roomTable.playersCount} + 1` })
      .where(eq(roomTable.id, roomCode));


    const newuser: NewUser = {
      id: uuidv4(),
      name: userName,
      roomId: roomCode
    }
    const [user] = await db.insert(userTable).values(newuser).returning();

    if (!user) {
      res.status(500).send(`Failed to create user`);
      return
    }

    res.status(201).json({
      success: true,
      message: `User with id: ${user.id} joined rooom : ${room.id}`,
      data: {
        userId: user.id
      }
    })


  } catch (error) {
    console.log(`error :  `, error)
    res.send(500).json({ error: `Failed to join room` })
  }
}

export { createRoom, deleteRoom, joinRoom };
