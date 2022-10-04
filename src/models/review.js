import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Review = new Schema({
    title: {type: String, required: true},
    star: { type: Number, required: true },
    content: { type: String, required: true },
    product: { type: mongoose.Types.ObjectId, ref: 'product', required: true },
    user: { type: mongoose.Types.ObjectId, ref: 'user', required: true },
    status: {type: Number, default: 0}
}, { timestamps: true })

export default mongoose.model('review', Review)