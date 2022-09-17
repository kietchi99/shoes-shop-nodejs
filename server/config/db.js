import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Connection URL
const uri = process.env.MONGO_URI
const connectDB = async connect => {
    try{
        await mongoose.connect(uri)
        console.log("connected to MongoDB")
    }catch (err){
        console.log(err)
    }
}

export default connectDB