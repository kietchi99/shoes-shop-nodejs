import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'

const Schema = mongoose.Schema

const User = new Schema({
    fullName: {
        type: String,
        required: [true, 'Tên không được bỏ trống']
    }, 
    email: {
        type: String, 
        require: [true, 'Email không được bỏ trống'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Email không hợp lệ']
    },
    password: {
        type: String, 
        require: [true, 'Mật khẩu không được bỏ trống'],
        minLength: 8,
        select: false    
    },
    passwordConfirm: {
        type: String, 
        required: [true, 'Hãy xác nhận mật khẩu'],
        validate: {
            //save
            validator: function(val) {
                return val === this.password;
            },
            message: 'Mật khẩu không khớp'
        }
    },
    photo: {
        type: String,
        default: 'default.png',
    },
    status: {
        type: Number,
        default: 1
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: "customer"
    },
    phone: String,
    address: String
},  { timestamps: true })

// Mã hóa mật khẩu trước khi lưu
User.pre('save', async function(next) {
    if(!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    this.passwordConfirm = undefined;
    next()
})

User.methods.correctPassword = async function (DBpassword, userPassword){
    return await bcrypt.compare(DBpassword, userPassword)
}

User.methods.changedPasswordAfter = function (JWTTime){
    if(this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        )
        return JWTTime < changedTimestamp
    }
    return false
}
export default  mongoose.model('user', User)

