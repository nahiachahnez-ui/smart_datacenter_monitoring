import { io } from "socket.io-client";
import API_IP from "../config";

const socket = io(`http://${API_IP}:5000`, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
