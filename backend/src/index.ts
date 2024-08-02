import { Socket } from "socket.io";
import http from "http";

import express from "express";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(http);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// app.get("/", (req, res) => {
//     res.sendFile(join(__dirname, "index.html"));
// });

io.on("connection", (socket: Socket) => {
    console.log("a user connected");
});

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});
