import mongoose from "mongoose";

const connectionDb = async () => {

    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/next-dashboard");
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(error);
    }
}

export default connectionDb;