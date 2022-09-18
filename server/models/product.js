import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Product = new Schema({
    productName: {
        type: String,
        required: true,
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    brand: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "Còn hàng"
    },
    describe: String,
    categories: [String],
    reviews: [{ type: mongoose.Types.ObjectId, ref: 'review'}],
    avatar: String,
    images: [String],
    sizes: {},
    color: String,
    price: { type: Number, required: true },
    discount: {type: Number, default: 0 },
    sold: {type: Number, default: 0 },
},
    { timestamps: true }
)

export default mongoose.model('product', Product)