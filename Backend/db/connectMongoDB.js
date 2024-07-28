import mongoose from "mongoose";

// Connect to MongoDB
const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connection Running :${conn.connection.host}`);

    }
    catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
}
export default connectMongoDB;