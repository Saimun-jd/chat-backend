import mongoose from "mongoose";
 export const connectToDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("connected to database");
    } catch(err) {
        console.log("error connecting to MongoDB ", err.message);
    }
 }