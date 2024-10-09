import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import { connectToDB } from "./db/connectToMongoDB.js";
import messageRoutes from "./routes/message.routes.js";
import friendsRoutes from "./routes/friends.routes.js";
import cors from "cors";
import sgMail from "@sendgrid/mail"


const app = express()
const corsOptions = {
    origin: ['http://localhost:3000',, 'https://mychatify-react.vercel.app'],
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

app.listen(PORT, () => {
    connectToDB();
    console.log(`server running on port ${PORT}`);
})