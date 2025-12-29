import { io } from "socket.io-client"


import config from "./config";

const socket = io(config.env.server_url, { autoConnect: false });

export default socket;
