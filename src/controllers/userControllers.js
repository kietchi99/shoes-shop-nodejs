import User from '../models/user.js'
import { handleDate, paginate, filterObj } from '../utils/index.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

// Get a user by id
// [GET] api/v1/users/:id
// Private
// Addmin
export const getUser = catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) return next(new AppError('Không tìm thấy người dùng', 404))

    res.status(200).json({
        status: 'Success',
        data: {
            user
        }
    })
})

// Get all users
// [GET] api/v1/users
// Private
// Admin
export const getAllUsers = catchAsync(async (req, res) => {
    let { keyword, page } = req.query
    let tempQuery = []

    //search
    if (keyword){
        tempQuery.push({
            $match: {
                $or: 
                    [
                        { fullName : { $regex: keyword, $options: 'i'}}, 
                        { email : { $regex: keyword, $options: 'i' }}
                    ] 
            }
        })
    }

    const { query, totalPage, currentPage }  = await paginate(tempQuery, User, page)
    
    const users = await User.aggregate(query)
    res.status(200).json({  
        status: 'Success',
        data: {
            users,
            meta: { 
                totalPage,  
                currentPage
            } 
        }
    })
})

// Update profile
// [PATCH] api/v1/users/updateProfile
// Private
// Customer
export const updateMyProfile = catchAsync(async (req, res) => {
    const filteredBody = filterObj(req.body, 'fullName', 'email')

    if(req.file) filteredBody.photo = req.file.filename

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
})


// Update pasword 
// [PATCH] api/v1/users/updatepassword
// Private
// Customer
export const updateMyPassword = catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('+password')

    if( await user.correctPassword(req.body.password, user.password) === false ) {
        return next(new AppError('Mật khẩu không khớp', 400))
    }

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    await user.save()
    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

// Update user
// [PATCH] api/v1/users/:id
// Private
// Admin
export const updateUser =  catchAsync(async(req, res) => {
    const filteredBody = filterObj(req.body, 'status', 'role')

    const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
        new: true,
        runValidators: true
    })

    if (!updatedUser) return next(new AppError('Không tìm thấy người dùng', 404))

    res.status(200).json({
        status: 'Success',
        data: {
            updatedUser
        }
    })
})

// Total user
// [GET] api/v1/users/total
// Private
// Admin
export const totalUsers = catchAsync(async (req, res) => {
    let totalUsers = 0
    if(req.query.month && req.query.year) {
        const {start, end} = handleDate(req.query.month, req.query.year)
        totalUsers = await User.aggregate([
            {$match: {createdAt: {$gte: start, $lte: end } }}, 
            {
                $group: {_id: {$dateToString: {"date": "$createdAt","format": "%Y-%m"}},
                Count: {$sum: 1}}
            }
        ])
        totalUsers = totalUsers.length === 0 ? 0 : totalUsers[0].Count
    }else{ 
        totalUsers = await User.countDocuments({})
    }
    res.status(200).json({
        status: 'Success', 
        data: {
            totalUsers
        }
    })
})