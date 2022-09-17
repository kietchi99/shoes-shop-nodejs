import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import User from '../models/user.js'
import { sendMail, hashPassword } from '../utils/util.js'
import Otp from '../models/otp.js'

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
            const user = await User.create(req.body)
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
                /*
                let cartTemp = req.session.cart
                if (cartTemp.items.length > 0) {
                    const user = await User.findOne({_id: id})
                    if(user.cart.items.length > 0){
                        user.cart.totalItems += cartTemp.totalItems
                        cartTemp.items.forEach(async element => {
                            const index = user.cart.items.findIndex(item => element.sku===item.sku && element.size === item.size)
                            if (index === -1) {
                                let product = await Product.findOne({ sku: element.sku }) 
                                user.cart.items.push({ 
                                    sku: element.sku, 
                                    size: element.size,
                                    product: product.productName,
                                    qty: 1
                                })
                                await User.updateOne( { _id: id }, {cart: user.cart})
                            }else{
                                user.cart.items[index].qty++
                                await User.updateOne( { _id: id }, {cart: user.cart})
                            }
                        })
                        req.session.cart = {
                            totalItems: 0,
                            items: []
                        }
                        }else {
                            await User.updateOne({_id: id}, {cart: cartTemp})
                            req.session.cart = {
                                totalItems: 0, 
                                items: []
                            }
                        }
                }*/
            }else throw err
            res.status(200).json({status: 'Success', message: 'Đăng nhập thành công', data: user.fullName})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },
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
            const query = []
            //search
            if (keyword){
                query.push({
                    $match: {$or: [
                        {fullName : { $regex: keyword, $options: 'i'}}, 
                        {email : { $regex: keyword, $options: 'i' }}
                    ] }
                })
            }
            // pagination
            let total = 0


            if (query.length > 0) {
                total =  await User.aggregate(query)
                total = total.length
            }else{
                total =  await User.countDocuments(query)
            }


            page = (page)?parseInt(page):1
            let perPage = 1;
            let skip = (page-1) * perPage;
            let totalPage = Math.ceil(total/perPage)
        
            query.push({ $skip: skip })
            query.push({ $limit: perPage })

            const Users = await User.aggregate(query)
            res.status(200).json({ 
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: Users, 
                meta: { totalPage,  currentPage: page} 
            })
        }catch(err){
            res.status(400).json({status: 'Error', message: err.message })
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
            let totalUser = 0
            // count users goup by month and year
            if(req.query.month && req.query.year) {
                totalUser = await User.aggregate([{$match: {}}, {$group: {id: {$dateToString: {"date": "$createdAt","format": "%Y-%m"}},Count: {$sum: 1},}}])
                totalUser = totalUser[0].Count
            //count all users
            }else{ 
                totalUser = await User.countDocuments({})
            }
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalUser})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    }
}

export default userControllers