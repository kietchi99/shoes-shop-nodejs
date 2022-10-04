import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import Product from '../models/product.js'
import User from '../models/user.js'
import Review from '../models/review.js'
import Otp from '../models/otp.js'
import jwt from 'jsonwebtoken'
import Order from '../models/order.js'

const sendMail = async (email) => {
    try {
        await Otp.deleteMany({ email})
        const code = Math.floor((Math.random() * 1000) + 1 )
        await Otp.create({email , code, expireIn: new Date().getTime() + 300 * 1000})
        // setup nodemailer
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            secure: false,
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        })
        let info = transporter.sendMail({
            from: `"Nodejs" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "your code",
            text: `${code}`,
            html: `<b>${code}</b>`,
        })
        console.log('Đã gửi mail thành công')
    }catch(err){
        console.log(err)
    }
}

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt()
    password = await bcrypt.hash(password, salt)
    return password
}

const handleColor = (sku) => {
    const colorCode = sku.slice(sku.indexOf('-') + 1)
    const listColors = {
        '10': 'red',
        '11': 'blue',
        '12': 'black',
        '13': 'white',
        '14': 'yellow',
        '15': 'orange',
        '16': 'grey',
        '17': 'brown',
        '18': 'multi',
        '19': 'purple'
    }
    return listColors[colorCode]
}

const handleSize = (data) =>{
    const sizes = {}
    for (let key in data) {
        if (key.includes('size') && (Number(data[key]) !== 0)){
            sizes[Number(key.slice(-2))] = Number(data[key])
        }
    }
    return sizes
} 

const currentUser = async (token) => {
    try{
        if (!token) throw 'Người dùng chưa đăng nhập'
        const result = jwt.verify(token, process.env.JWT_SECRECT)
        if (!result) throw 'Token không đúng định dạng'
        const user = await User.findOne({ id: result.id })
        if (!user) throw ('Người dùng không tồn tại')
        return {user}
    }catch(err){
        return {err}
    }
}
const decoded = (token) =>{
    try{
        if (!token) throw 'chua dang nhap'
        const result = jwt.verify(token, process.env.JWT_SECRECT)
        if (!result) throw "Token không đúng định dạng"
        const id  = result.id
        return {id}
    }catch(err) {
        return {err}
    }
}

const handleDate = (month, year) => {
    month = Number(month)-1
    year = Number(year)
    const start = new Date(Date.UTC(year, month))
    const end = new Date(Date.UTC(year, month+1))
    return {start, end}
}

const makePipelineReview = async ({ keyword, page }) => {
    let query = [
        {
            $lookup: {
                from: 'products', 
                localField: 'product', 
                foreignField: '_id', 
                as: 'product'
            }
        },
        {
            $lookup: {
                from: 'users', 
                localField: 'user', 
                foreignField: '_id', 
                as: 'user'
            }
        }
    ]

    //search
    if(keyword){
        query.push({
            $match: { 
                $or :[
                    { title : { $regex: keyword, $options: 'i'}},
                    { content : { $regex: keyword, $options: 'i'}},
                    { createdAt : { $regex: keyword, $options: 'i'}},
                    { 'user.fullName' : { $regex: keyword, $options: 'i'}},
                    { 'product.productName' : { $regex: keyword, $options: 'i'}},
                ]
            }
        })
    }
    return paginate (query, Review, page)
}

const makePipelineOrder = async ({ keyword, page }) => {
    // chia theo model

    let query = [
        {
            $lookup: {
                from: 'users', 
                localField: 'customer', 
                foreignField: '_id', 
                as: 'customer'
            }
        }
    ]

    //search
    if(keyword){
        query.push({
            $match: { 
                $or :[
                    { 'customer.fullName' : { $regex: keyword, $options: 'i'}},
                    { 'customer.email' : { $regex: keyword, $options: 'i'}},
                    { createdAt : { $regex: keyword, $options: 'i'}},
                    { consignee : { $regex: keyword, $options: 'i'}},
                    { phone : { $regex: keyword, $options: 'i'}},
                ]
            }
        })
    }
    return paginate (query, Order, page)
}

const makePipelineProduct = async (query, { page, keyword, color, brand, category }) =>{
    //search
    if (keyword){
        query.push({
            $match: { 
                $or :[
                    { productName : { $regex: keyword, $options: 'i'}},
                    { brand : { $regex: keyword, $options: 'i'}},
                    { sku : { $regex: keyword, $options: 'i'}}
                ]
            }
        })
    }
    //filter
    if (color && color!=='undefined'){
        if (color.includes(',')){
            color = color.split(',')
            query.push({ $match: { color: { $in: color } } })
        }else {
            query.push({ $match: {color: color} })
        }
    }
    //brand
    if (brand && brand!=='undefined'){
        if (brand.includes(',')){
            brand = brand.split(',')
            query.push({ $match: {brand: { $in: brand } } })
        }else{
            query.push({ $match: {brand: brand }} )
        }
    }
    //category
    if (category && category!=='undefined'){
        if (category.includes(',')){
            category = category.split(',')
            query.push({ $match: {categories: {$in: category }} })
        }else {
            query.push({ $match: {categories: category }})
        }
    }
    return paginate (query, Product, page)
}

const paginate = async (query, Model, page) => {
    try {
        let total = 0
        if (query.length > 0){
            total =  await Model.aggregate(query)
            total = total.length
        }else total =  await Model.countDocuments(query)
        
        page = (page)?parseInt(page):1
        let perPage = 1;
        let skip = (page-1) * perPage;
        let totalPage = Math.ceil(total/perPage)
        
        query.push({ $skip: skip })
        query.push({ $limit: perPage })

        return { 
            query, 
            totalPage, 
            currentPage: page 
        } 
    }catch(err) {
        console.log(err)
        return { err } 
    }
} 

export { sendMail, hashPassword, makePipelineProduct, handleSize, handleColor, makePipelineReview, currentUser, decoded, handleDate, makePipelineOrder, paginate}