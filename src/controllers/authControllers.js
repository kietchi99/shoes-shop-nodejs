import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'
import util from 'util'

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


// protect
export const protect = catchAsync(async(req, res, next) => {
    let token; 
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token) {
        return next(new AppError('Bạn chưa đăng nhập', 401))
    }

    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRECT)
    
    const currentUser = await User.findById(decoded.id)
    if (!currentUser || currentUser.status === 0) {
        return next(new AppError('Người dùng không tồn tại', 404))
    } 

    if(currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Mật khẩu vừa mới thay đổi, hãy đăng nhập lại', 401))
    }

    req.user = currentUser
    next()
})

// restrictTo 
export const restrictTo = (...roles) => {
    return (req, res, next)=>{
        if(!roles.includes(req.user.role)) {
            return next(new AppError('Không có quyền truy cập', 403))
        }
        next()
    }
}