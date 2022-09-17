import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Otp = new Schema({
        email: String,
        code: String,
        createdAt: { type: Date, expires: '1m', default: Date.now }
    }
)
export default mongoose.model('otp', Otp)