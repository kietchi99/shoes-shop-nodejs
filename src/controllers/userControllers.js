import User from '../models/user.js'
import { handleDate, paginate, filterObj } from '../utils/util.js'


// get a user by id
// [GET] api/v1/users/:id
export const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id).select('-password')

        if (!user) {
            throw ('không tìm thấy người dùng')
        }
        res.status(200).json({
            status: 'Success',
            data: {
                user
            }
        })
    }catch(err){
        res.status(500).json({status: 'error', message: err})
    }
}

// get all users
// [GET] api/v1/users/
export const getAllusers = async (req, res) => {
    try {
        let { keyword, page } = req.query
        let tempQuery = []

        //search
        if (keyword){
            tempQuery.push({
                $match: {$or: [
                    {fullName : { $regex: keyword, $options: 'i'}}, 
                    {email : { $regex: keyword, $options: 'i' }}
                ] }
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
    }catch(err){
        console.log(err)
        res.status(400).json({status: 'Error', message: err })
    }
}

// update profile
// [PATCH] api/v1/users/updateProfile
export const updateProfile = async (req, res) => {
    try{
        const filteredBody = filterObj(req.body, 'fullName', 'email')
        if(req.file) {
            filteredBody.photo = req.file.filename
        }
        filteredBody.photo = '' ? undefined : filteredBody.photo
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
    }catch(err){
        console.log(err)
        res.status(500).json({status: 'Error', message: err})
    }
}


// update pasword 
// [PATCH] api/v1/users/updatepassword
export const updateMyPassword = async (req, res) => {
    try{  
        const user = await User.findById(req.user.id).select('+password')

        if(!(await user.correctPassword(req.body.passwordConfirm, user.password))) {
            throw('Mật khẩu không khớp')
        }

        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save()
    }catch(err){
        console.log(err)
        res.status(500).json({status: 'Error', message: err})
    }
}

//update user
// [PATCH] api/v1/users/:id
export const updateUser =  async (req, res) => {
    try{
        const filteredBody = filterObj(req.body, 'status', 'role')

        const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
            new: true,
            runValidators: true
        })

        if(!updatedUser) {
            throw ('không tìm thấy người dùng')
        }

        res.status(200).json({
            status: 'Success',
            data: {
                updatedUser
            }
        })
    }catch(err){
        res.status(500).json({status: 'Error', message: err})
    }
}

//total user
// [GET] api/v1/users/total
export const totalUsers = async (req, res) => {
    try{
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
        res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalUsers})
    }catch(err){
        console.log(err)
        res.status(500).json({status: 'Error', message: err})
    }
}