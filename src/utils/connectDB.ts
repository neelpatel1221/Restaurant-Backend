import { seedUser } from "../seeders/userSeeder";
import mongoose from "mongoose";

export const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB Connected");

        await seedUser();

        mongoose.connection.on('connected', () => console.log('MongoDB connected.'));
        mongoose.connection.on('disconnected', () => console.error('MongoDB disconnected.'));
        mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));

        process.on('SIGINT', async () => {
        console.log('Gracefully shutting down...');
        await mongoose.connection.close();
        process.exit(0);
        });
        
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}