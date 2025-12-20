// import { db } from "../database/db";
// import { roomTable } from "../database/schema/tables";

// const createRoom = async () => {
//   const newRoom = await db
//     .insert(roomTable)
//     .values({
//       admin: "Amaan",
//       playersCount: 1,
//       roomName: "Test room",
//       id: "ABCD",
//     })
//     .returning();

//   console.log("room created", newRoom);
// };

// createRoom().then(() => process.exit(0));
