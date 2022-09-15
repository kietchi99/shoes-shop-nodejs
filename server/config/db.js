import { MongoClient } from 'mongodb'

// Connection URL
const uri = process.env.DB_URL

const connectDB = async connect => {
    try{
        await mongoose.connect(uri)
        console.log("connected to MongoDB")
    }catch (err){
        console.log(err)
    }
}

export default connectDB