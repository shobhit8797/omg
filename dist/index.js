"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
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
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const server = (0, http_1.createServer)(app);
const JWT_SECRET = "your_jwt_secret";
let waitingUsers = []; // Store users waiting to be matched
const rooms = {}; // Store room participants
// Set up CORS and socket.io with TypeScript types
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    },
});
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
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
        const receivingUser = socket.id === rooms[roomId].user1
            ? rooms[roomId].user2
            : rooms[roomId].user1;
        console.log("emitted offer to:", receivingUser);
        io.to(receivingUser).emit("offer", { roomId, sdp });
    });
    socket.on("answer", ({ roomId, sdp }) => {
        console.log("answer received for room:", roomId, socket.id);
        const receivingUser = socket.id === rooms[roomId].user1
            ? rooms[roomId].user2
            : rooms[roomId].user1;
        io.to(receivingUser).emit("answer", {
            sdp,
            roomId,
        });
    });
    socket.on("add-ice-candidate", ({ candidate, type, roomId, }) => {
        var _a, _b, _c;
        const targetUser = socket.id === ((_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.user1)
            ? (_b = rooms[roomId]) === null || _b === void 0 ? void 0 : _b.user2
            : (_c = rooms[roomId]) === null || _c === void 0 ? void 0 : _c.user1;
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
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        const user = yield prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
            },
        });
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred during signup" });
    }
}));
// Login endpoint
app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        // Find user by email
        const user = yield prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // Check password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET);
        res.json({ token, message: "Login successful" });
    }
    catch (error) {
        res.status(500).json({ error: "An error occurred during login" });
    }
}));
server.listen(8000, () => {
    console.log("server running at http://localhost:8000");
});
