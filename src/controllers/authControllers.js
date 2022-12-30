import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

//sign token
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRECT, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

//send token 
const createAndSendToken = (user, status, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 //90d
        ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    user.password = undefined

    res.status(status).json({
        status,
        token,
        data: {
            user
        }
    })
}

//sign up
//[POST] api/users/signup
//public
export const signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body)
    createAndSendToken(newUser, 201, res)
})

// login
// [POST] users/login
// public
export const logIn = catchAsync(async(req, res, next)=>{
    const { email, password } = req.body

    if(!email || !password) return next(new AppError('Email và mật khẩu không được bỏ trống', 400))

    const user = await User.findOne({ email }).select('+password')
    const correct = await user.correctPassword(password, user.password) 

    if(!user || !correct) return next(new AppError('Email hoặc mật khẩu không đúng', 400))

    createAndSendToken(user, 200, res)
})