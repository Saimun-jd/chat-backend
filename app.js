import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectToDB } from "./db/connectToMongoDB.js";
import messageRoutes from "./routes/message.routes.js";
import friendsRoutes from "./routes/friends.routes.js";
import oceanRoutes from "./routes/ocean.routes.js";
import cors from "cors";
import sgMail from "@sendgrid/mail"
import {Server} from 'socket.io';
import {createServer} from 'http';

const app = express()
const server = createServer(app);
const corsOptions = {
    origin: ['http://localhost:3000', 'https://slurpping.onrender.com', 'http://localhost:5173'],
    credentials:true,
	optionsSuccessStatus: 200,
    methods: ["POST", "GET"]
};
app.use(cors(corsOptions));
dotenv.config()
app.use(express.json());
app.use(cookieParser());
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
     res.send("Hello from chatify");
})

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/ocean", oceanRoutes);

const io = new Server(server, {
    pingTimeout: 6000,
    cors: {
        origin: ['http://localhost:3000', 'https://slurpping.onrender.com']
    }
})
// store online users
let activeUsers = [];
io.on('connection', (socket) => {
    socket.on('new-user-add', (newUserId) => {
        if(!activeUsers.some((user) => user._id === newUserId)) {
            activeUsers.push({_id: newUserId, socketId: socket.id});
            console.log("new user connected");
        }
        io.emit('get-users', activeUsers);
    })

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        io.emit('get-users', activeUsers);
    })
})

global.io = io;

server.listen(PORT, () => {
    connectToDB();
    console.log(`server running on port ${PORT}`);
})