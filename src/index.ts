const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const server = createServer(app);

const JWT_SECRET = "your_jwt_secret";

const io = new Server(server, {
    cors: {
        origin: "*", // https://omg-frontend-kappa.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    },
});

app.use(cors({ origin: "*" }));
app.use(express.json());

let waitingUsers = []; // Store users waiting to be matched
const rooms = {}; // Store room participants

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

app.get("/test", (req, res) => {
    res.send({
        message: "Hello World",
    });
});

io.on("connection", (socket) => {
    console.log("a user connected");

    // Add the user to the waiting list
    waitingUsers.push(socket.id);
    io.to(socket.id).emit("lobby", {});

    console.log("waiting users:", waitingUsers);

    // Check if there are at least two users waiting
    if (waitingUsers.length >= 2) {
        // Create a new room ID
        const roomId = `room-${Date.now()}`;
        const user1 = waitingUsers.shift();
        const user2 = waitingUsers.shift();

        // Assign both users to the new room
        rooms[roomId] = { user1: user1, user2: user2 };

        // Notify both users of the new room assignment
        io.to(user1).emit("send-offer", { roomId });
        io.to(user2).emit("send-offer", { roomId });
    }

    socket.on("offer", ({ sdp, roomId }) => {
        console.log("offer received for room:", roomId, socket.id);

        const receivingUser =
            socket.id === rooms[roomId].user1
                ? rooms[roomId].user2
                : rooms[roomId].user1;
        console.log("emmited offer to:", receivingUser);

        io.to(receivingUser).emit("offer", { roomId, sdp });
    });

    socket.on("answer", ({ roomId, sdp }) => {
        console.log("answer received for room:", roomId, socket.id);
        const receivingUser =
            socket.id === rooms[roomId].user1
                ? rooms[roomId].user2
                : rooms[roomId].user1;
        io.to(receivingUser).emit("answer", {
            sdp,
            roomId,
        });
    });

    socket.on("add-ice-candidate", ({ candidate, type, roomId }) => {
        const targetUser =
            socket.id == rooms[roomId]?.user1
                ? rooms[roomId]?.user2
                : rooms[roomId]?.user1;
        if (!targetUser) {
            return;
        }
        io.to(targetUser).emit("add-ice-candidate", { candidate, type });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

// Auth Routes
// Signup endpoint
app.post("/signup", async (req, res) => {
    console.log(req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        console.log("fetching user");
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        console.log("No user found:", existingUser);

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        console.log("creating user");
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        console.log("User created:", user);

        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred during signup" });
    }
});
// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        console.log("User found:", user);

        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        console.log("Token:", token);

        // , {
        //     expiresIn: "1h",
        // });
        res.json({ token, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred during login" });
    }
});

server.listen(8000, () => {
    console.log("server running at http://localhost:8000");
});
