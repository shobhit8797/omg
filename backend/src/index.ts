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
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("send-message", (message, callback) => {
        console.log("send-message", message);
        callback("message received");
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
