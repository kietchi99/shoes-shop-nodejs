import mongoose from 'mongoose'
const Schema = mongoose.Schema

const Order = new Schema({
    customer: { type: mongoose.Types.ObjectId, ref: 'user'},
    consignee: String, 
    address: String,
    phone: String,
    items: [{
        sku: String,
        productName: String,
        qty: Number,
        price: Number,
        subTotal: Number,
    }],
    total: Number, 
    status: {type: Array, default: {
            code: 0, 
            createAt: new Date(),
        }
    },
    paymentStatus: {type: Number, default: 0},
    payments: {type: String, default: 'cod'},
    transportCost: {Number, default: 0}
}, { timestamps: true })

export default mongoose.model('order', Order)

