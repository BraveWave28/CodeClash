// socket.js
import { io } from "socket.io-client";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4444";
const socket = io(BACKEND_URL);

export default socket;
