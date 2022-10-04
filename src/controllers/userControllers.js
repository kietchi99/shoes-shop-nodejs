import jwt from 'jsonwebtoken'
import _ from 'lodash'
import bcrypt from 'bcrypt'
import User from '../models/user.js'
import { sendMail, hashPassword, handleDate, paginate } from '../utils/util.js'
import Otp from '../models/otp.js'
import Product from '../models/product.js'


const userControllers = {
    //get curent user 
    //[GET] api/user/current-user
    currentUser: async (req, res) => {
        const token =  req.cookies.user
        try{
            if (token) {
                jwt.verify(token, process.env.JWT_SECRECT, async (err, decodedToken) => {
                    if (err) {
                        throw ('Token không đúng định dạng')
                        //res.locals.user = null
                        //next()
                    }else {
                        let user = await User.findById(decodedToken.id)
                        if (!user) {
                            throw ('Không tìm thấy người dùng')
                        }
                        user = user.toObject()
                        res.status(200).json({status: 'Success', message: 'Yêu cầu đã được thực hiện', data: user.fullName })
                    }
                })
            }else{
                throw ('Người dùng chưa đăng nhập')
            }
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },
    //[POST] api/user/sign-up 
    //create a new user
    signUp: async (req, res) => {
        try{
            const password = await hashPassword(req.body.password)
            const infor = _.omit(req.body, password)
            const user = await User.create({ ...infor, password })
            res.status(200).json({status: 'Success', message: 'Người dùng mới được tạo', data: user.fullName})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[POST] api/user/sign-in 
    //sign in 
    signIn: async (req, res) => {
        try{
            const { email, password, phone }  = req.body
            const key = email ? { email }: { phone }
            const { user, err } = await User.login(key, password)
            if(user){
                const id = user._id
                const maxAge = 3 * 24 * 60 * 60
                const token = jwt.sign({id}, process.env.JWT_SECRECT, {expiresIn: maxAge})
                res.cookie('user', token, {httpOnly: true, maxAge: maxAge * 1000})
                if(!req.session.cart) req.session.cart = []
                if (req.session.cart.length > 0) {// trường hợp session cart có item
                    let cartTemp = req.session.cart
                    if(user.cart.length > 0){ // trường hợp user cart có item
                        cartTemp.forEach(async element => {
                            const index = user.cart.findIndex(item => item.product.equals(element.product) && item.size===element.size )
                            if (index === -1) {
                                user.cart.push({ //trùng hợp không trùng item
                                    size: element.size,
                                    product: element.product,
                                    qty: 1
                                })
                                await user.save()
                            }else{// trường hợp trùng item
                                user.cart[index].qty++
                                await user.save()
                            }
                        })
                        req.session.cart = []
                    }else {// trường hợp user cart không có item
                        user.cart = cartTemp
                        await user.save()
                        req.session.cart = []
                    }
                }
            }else throw 'Chưa đăng nhập'
            res.status(200).json({status: 'Success', message: 'Đăng nhập thành công', data: user.fullName})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },
    //sign out
    //[GET] api/users/sign-out
    signOut: (req, res) => {
        res.cookie('user', '', {maxAge: 1})
    }
    ,
    //[GET] api/user/:id/getbyid  
    //get a user by id
    getUserById: async (req, res) => {
        try{
            const user = await User.findOne({ _id: req.params.id })
            console.log(user)
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: user})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[GET] api/users?page?search?
    //get all users by page
    //admin
    getAllusers: async (req, res) => {
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
            // pagination
            const { query, totalPage, currentPage, err }  = await paginate(tempQuery, User, page)
            if (err) throw 'Lỗi truy vấn cơ sở dữ liệu'
            
            const Users = await User.aggregate(query)
            res.status(200).json({ 
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: Users, 
                meta: { totalPage,  currentPage} 
            })
        }catch(err){
            console.log(err)
            res.status(400).json({status: 'Error', message: err })
        }

    },

    //[PUT] api/users/profile/:id/edit 
    //update profile
    updateProfile: async (req, res) => {
        
        try{
            let { fullName, email, phone, address } = req.body
            const user = await User.findOne({ id: req.params.id })

            fullName = fullName || user.fullName
            email = email || user.email
            phone = phone || user.phone
            address = address || user.address

            await User.updateOne({id: req.params.id}, { fullName, email, phone, address })

            res.status(200).json({status: 'Success', message: 'cập nhật thành công'})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[PUT] api/user/:id/reset-password 
    //reset password
    resetPassword: async (req, res) => {
        let { currentPassword, newPassword, confirmPassword } = req.body
        try{  
            const { id } = jwt.verify(req.cookies.user, process.env.JWT_SECRECT)

            const user = await User.findOne({id})
            if(!user) throw "Người dùng không tồn tại"

            const checkCurrentPassword = await bcrypt.compare(currentPassword, user.password)
            if(!checkCurrentPassword) throw "Mật khẩu không đúng"

            const checkNewPassword = await bcrypt.compare(newPassword, user.password)
            if(checkNewPassword) throw "Bạn đang nhập mật khẩu cũ"

            if(confirmPassword !== newPassword) throw "Mật khẩu không khớp"

            newPassword = await hashPassword(newPassword)
            await User.updateOne({id},{password: newPassword})

            res.status(200).json({status: 'Success', message: 'Đổi mật khẩu thành công'})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[PUT] api/user/forgot-password 
    //fogot password
    forgotPassword: async (req, res) => {
        const { email, code, password, confirmpass, phone, id } = req.body
        try{
            if(email && !code) {//kiem tra email
                const user = await User.findOne( {email} ) 
                if (!user) throw "Người dùng không tồn tại"
                await sendMail(email)
                res.status(200).json({status: 'Success', message: 'Thông tin chính xác', data: user.email})
            }else if(code){//kiem tra code

                const result = await Otp.findOne({ email, code })
                if (!result) throw "Mã xác nhận không đúng hoặc đã quá hạn"
                res.status(200).send({status: 'Success', message: 'Xác nhận thành công'})

            }else if(password && confirmpass){//kiem tra mat khau
                if (password !==confirmpass) throw "Mật khẩu không khớp"
                const hashPassword = await hashPassword(password)
                await User.updateOne({email}, {password})
                res.status(200).json({status: 'Success', message: 'Đặt lại mật khẩu thành công'})
            }
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[PUT] api/user/:id/edit 
    // update a user
    updateUser: async (req, res) => {
        let { fullName, email, phone, address, type } = req.body
        try{
            const user = await User.findOne({ id: req.params.id })

            fullName = fullName || user.fullName
            email = email || user.email
            phone = phone || user.phone
            address = address || user.address
            type = type || user.type

            await User.updateOne({id: req.params.id}, { fullName, email, phone, address })

            res.status(200).json({status: 'Success', message: 'cập nhật thành công', data: updateUser})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[GET] || api/user/total?month?year
    //total users
    totalUsers: async (req, res) => {
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
}

export default userControllers