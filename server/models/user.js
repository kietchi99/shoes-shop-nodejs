import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const Schema = mongoose.Schema

const User = new Schema({
    fullName: {
        type: String,
        required: true
    }, 
    useName: {
        type: String,
        lowercase: true
    },
    email: {
        type: String, 
        required: true,
        unique: true,
        lowercase: true,
        validate: validator.isEmail
    },
    password: {
        type: String, 
        required: true,
        minLength: 8    
    },
    avatar: {type: String},
    status: {
        type: String,
        required: true,
        default: "active"
    },
    type: {
        type: String,
        required: true,
        default: "customer"
    },
    gender: String,
    phone: String,
    address: String,
    cart: {
        items: [{
            sku: String, 
            size: String,
            qty: Number,
            product: String,
            price: {
                base: Number, 
                discount: Number
            },
            subTotal: Number
        }],
        totalItems: {type: Number, default: 0}
    }
},  { timestamps: true })

// Mã hóa mật khẩu trước khi lưu
User.pre('save', async function(next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

//xác thực tài khoản
User.statics.login = async function(key, password) {
    const user = await this.findOne(key)
    console.log(password)
    try{
        if (user) {
            const pass = await bcrypt.compare(password, user.password)
            console.log(pass)
            if (pass) {
                return {user}
            }else {
                throw 'Mật khẩu không đúng'
            }
        }else{
            throw 'Email không đúng'
        }
    }catch(err) {
        return {err}
    }
    
}

export default  mongoose.model('user', User)

