import cors from "cors";
const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const { createServer } = require("http");
const { Server, Socket } = require("socket.io");

// Set up types for request and response bodies
// interface SignupRequest extends Request {
//     body: {
//         username: string;
//         email: string;
//         password: string;
//     };
// }

// interface LoginRequest extends Request {
//     body: {
//         email: string;
//         password: string;
//     };
// }

const app = express();
const prisma = new PrismaClient();
const server = createServer(app);

const JWT_SECRET = "your_jwt_secret";

// Types for socket.io rooms and users
type Room = {
    user1: string;
    user2: string;
};

type Rooms = {
    [key: string]: Room;
};

let waitingUsers: string[] = []; // Store users waiting to be matched
const rooms: Rooms = {}; // Store room participants

// Set up CORS and socket.io with TypeScript types
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>Hello world</h1>");
});

app.get("/test", (req: Request, res: Response) => {
    res.send({
        message: "Hello World",
    });
});

io.on("connection", (socket: Socket) => {
    console.log("a user connected");

    // Add the user to the waiting list
    waitingUsers.push(socket.id);
    io.to(socket.id).emit("lobby", {});

    console.log("waiting users:", waitingUsers);

    // Check if there are at least two users waiting
    if (waitingUsers.length >= 2) {
        // Create a new room ID
        const roomId = `room-${Date.now()}`;
        const user1 = waitingUsers.shift()!;
        const user2 = waitingUsers.shift()!;

        // Assign both users to the new room
        rooms[roomId] = { user1: user1, user2: user2 };

        // Notify both users of the new room assignment
        io.to(user1).emit("send-offer", { roomId });
        io.to(user2).emit("send-offer", { roomId });
    }

    socket.on(
        "offer",
        ({ sdp, roomId }: { sdp: RTCSessionDescription; roomId: string }) => {
            console.log("offer received for room:", roomId, socket.id);

            const receivingUser =
                socket.id === rooms[roomId].user1
                    ? rooms[roomId].user2
                    : rooms[roomId].user1;
            console.log("emitted offer to:", receivingUser);

            io.to(receivingUser).emit("offer", { roomId, sdp });
        }
    );

    socket.on(
        "answer",
        ({ roomId, sdp }: { roomId: string; sdp: RTCSessionDescription }) => {
            console.log("answer received for room:", roomId, socket.id);
            const receivingUser =
                socket.id === rooms[roomId].user1
                    ? rooms[roomId].user2
                    : rooms[roomId].user1;
            io.to(receivingUser).emit("answer", {
                sdp,
                roomId,
            });
        }
    );

    socket.on(
        "add-ice-candidate",
        ({
            candidate,
            type,
            roomId,
        }: {
            candidate: RTCIceCandidate;
            type: string;
            roomId: string;
        }) => {
            const targetUser =
                socket.id === rooms[roomId]?.user1
                    ? rooms[roomId]?.user2
                    : rooms[roomId]?.user1;
            if (!targetUser) {
                return;
            }
            io.to(targetUser).emit("add-ice-candidate", { candidate, type });
        }
    );

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

// Auth Routes
// Signup endpoint
app.post("/signup", async (req: any, res: any) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during signup" });
    }
});

// Login endpoint
app.post("/login", async (req: any, res: any) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        res.json({ token, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during login" });
    }
});

server.listen(8000, () => {
    console.log("server running at http://localhost:8000");
});

module.exports = app;