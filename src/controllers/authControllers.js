import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createAndSendToken = (user, status, res) => {
    const token = signToken(user._id)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
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
export const signup = async(req, res, next) => {
    const newUser = await User.create(req.body)
    createAndSendToken(newUser, 201, res)
}

// login
// [POST] users/login
// public
export const logIn = catchAsync(async(req, res, next)=>{
    try {
        const { email, password } = req.body

        if(!email || !password) {
            throw ('Email và mật khẩu không được bỏ trống')
        }

        const user = await User.findOne({ email }).select('+password')
        const correct = await user.correctPassword(password, user.password) 

        if(!user || !correct) {
            throw ('Email hoặc mật khẩu không đúng')
        }
        createAndSendToken(user, 200, res)
    }catch(err) {
        res.status(400).json({
            status: 'error',
            message: err
        })
    }
})