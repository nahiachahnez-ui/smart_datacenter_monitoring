import { io } from "socket.io-client";

// Same IP as API — backend Socket.IO server
const socket = io("http://192.168.1.4:5000", {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
