import mongoose from 'mongoose'
import Product from '../models/product.js'
import Review from '../models/review.js'
import Order from '../models/order.js'

const toId = mongoose.Types.ObjectId

const handleInputProduct = (body) => {

    //handle color
    const colorCode = body.sku.slice(body.sku.indexOf('-') + 1)
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
    const color =  listColors[colorCode]

    //handle sizes 
    const sizes = []
    for (let key in body) {
        if (key.includes('size') && (Number(body[key]) !== 0)){
            const size = {}
            size.title = key.slice(4, 6)
            size.amount = body[key]
            sizes.push(size)
        }
    }

    //amount
    let amount = sizes.reduce((pre, curr)=>pre + Number(curr.amount), 0)

    const dataset = {
        ...body,
        amount,
        color,
        sizes,
        categories: ['male', 'female']
    }

    return dataset
}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(val => {
        if(Array.isArray(obj[val])) {
            let newImages = []
            obj[val].forEach((image)=>{
                if(image) newImages.push(image)
            })
            if(newImages.length > 0) newObj[val] = newImages
        }
        else if (obj[val] && allowedFields.includes(val)) {
            newObj[val] = obj[val]
        }
    })
    return newObj
}

const handleDate = (month, year) => {
    month = Number(month)-1
    year = Number(year)
    const start = new Date(Date.UTC(year, month))
    const end = new Date(Date.UTC(year, month+1))
    return { start, end }
}

const makePipelineReview = async ({ keyword, page}, id) => {
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
        },
        {
            $project: {
                _id: 1,
                title: 1,
                star: 1,
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                'user._id': 1,
                'user.fullName': 1,
                'product._id': 1,
                'product.productName': 1,
            }
        }
    ]
    //search
    if(keyword){
        query.push(
            {
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

const makePipelineOrder = async ({ keyword, page, status }, user) => {

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
    
    if(user.role === 'customer') {
        query.push(
            {
                $match: {
                    customer: { $elemMatch: { _id: user._id } }
                }
            }
        )
    }
    
    //filter
    if (status) {
        query.push(
            {
                $addFields: {
                    lastArrayElement: {
                        $slice: ["$status", -1],
                    }
                }
            },
            {
                $match: {
                    "lastArrayElement.code": Number(status)
                }
            },
            { $sort: { createdAt: -1 } }
        )
    }else{
        if(user.role === 'admin'){
            query.push({ $sort: { 'status.code': 1 } })
        }else{
            query.push({ $sort: { createdAt: -1 } })
        }
    }

    //search
    if(keyword){
        query.push({
            $match: { 
                $or :[
                    { 'customer.fullName' : { $regex: keyword, $options: 'i'}},
                    { 'customer.email' : { $regex: keyword, $options: 'i'}},
                    { 'customer.phone' : { $regex: keyword, $options: 'i'}},
                    { createdAt : { $regex: keyword, $options: 'i'}},
                ]
            }
        })
    }
    return paginate (query, Order, page)
}

const makePipelineProduct = async({ page, keyword, color, brand, category, sort, discount }) =>{
    try {
        let query = []
        // discount
        if(discount === 'true') query.push(
            { $match: { discount: {$gt: 0}} },
            { $sort: { discount : -1 }}
        )
        //sort
        if (sort && sort!=='Mặc định') {
            if(discount === 'true') query.pop()
            query.push(
                {
                    $project: {
                        productName: 1, 
                        sku: 1,
                        brand: 1,
                        status: 1,
                        categories: 1,
                        avatar: 1,
                        price: 1,
                        discount: 1,
                        sold: 1,
                        currentPrice: { $subtract: ['$price', {$multiply: ['$price', {$divide: ['$discount', 100] }]} ] }
                    }
                }, 
                { 
                    $sort: {
                        currentPrice: sort === 'asc'? 1:-1,
                        productName: 1,
                    } 
                }
            )
        }
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
        //color
        if (color){
            if (color.includes(',')){
                color = color.split(',')
                query.push({ $match: { color: { $in: color } } })
            }else {
                query.push({ $match: {color: color} })
            }
        }
        //brand
        if (brand){
            if (brand.includes(',')){
                brand = brand.split(',')
                query.push({ $match: {brand: { $in: brand } } })
            }else{
                query.push({ $match: {brand: brand }} )
            }
        }
        //category
        if (category){
            if (category.includes(',')){
                category = category.split(',')
                query.push({ $match: {categories: {$in: category }} })
            }else {
                query.push({ $match: {categories: category }})
            }
        }

        return await paginate(query, Product, page)
    }catch(err) {
        console.log(err)
        return { err }
    }
}


const paginate = async(query, Model, page) => {
    try{
        let total = 0

        if (query.length > 0){
            total =  await Model.aggregate(query)
            total = total.length
        }else total =  await Model.countDocuments(query)

        page = (page)?parseInt(page):1
        let perPage = 6;
        let skip = (page-1) * perPage;
        let totalPage = Math.ceil(total/perPage)

        query.push({ $skip: skip })
        query.push({ $limit: perPage })

        return { 
            query, 
            totalPage, 
            currentPage: page 
        }
    }catch(err){
        return { err }
    }
}

export {  
    handleInputProduct,
    makePipelineProduct,
    makePipelineReview,
    makePipelineOrder, 
    handleDate, 
    paginate,
    filterObj 
}