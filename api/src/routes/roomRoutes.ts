import { Router } from "express";

const router = Router()

import { createRoom, deleteRoom, joinRoom } from "../controllers/roomControllers"

router.post('/create', createRoom);
router.delete('/delete', deleteRoom);
router.post('/join', joinRoom);
export default router 
