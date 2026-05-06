import { io } from "socket.io-client";
import { API_IP } from "@env";

const socket = io(`http://${API_IP}:5000`, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
