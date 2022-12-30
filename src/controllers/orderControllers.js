import Order from '../models/order.js'
import User from '../models/user.js'
import { handleDate, makePipelineOrder } from '../utils/index.js'
import catchAsync from '../utils/catchAsync.js'
import AppError from '../utils/appError.js'

// Add a order
// [POST] api/v1/orders
// private
// Customer
export const addOrder = catchAsync(async (req, res) => {
    if(req.user.address !== req.body.address) {
        await User.updateOne({ _id: req.user._id }, { address: req.body.address }) 
    }
    if(req.user.phone !== req.body.phone) {
        await User.updateOne({ _id: req.user._id }, { phone: req.body.phone }) 
    }
    //if(!req.body.items || req.body.length === 0) {
    //    return next(new AppError('Đơn hàng không có sản phẩm', 400))
    //}

    const dataset = {
        ...req.body,
        items: [{
            productName: 'Nike air force 1',
            sku: '1111-14',
            qty: 2,
            price: 1500000,
            subTotal: 3000000
        }],
        customer: req.user._id,
    }
    const newOrder = await Order.create(dataset)

    res.status(201).json({
        status: 'Success',
        data: {
            newOrder
        }
    })
})

// Update order status
// [PATCH] api/v1/orders/:id
// Private
// Admin && cutomer
export const updateOrder = catchAsync(async (req, res) => {
    let order

    if(req.user.role === 'admin') {
        order = await Order.findById(req.params.id)
    } else if (req.user.role==='customer') {
        order = await Order.findOne({
            $and: [
                { _id: req.params.id },
                { customer: req.user.id }
            ]
        })
    } 
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404))
    
    if(
        req.user.role === 'customer' &&
        (
            order.status[order.status.length - 1].code !== 0,
            order.status[order.status.length - 1].code !== -1
        )

    ) return next(new AppError('Không thể hủy đơn hàng', 403)) 

    order.status.push({ code: Number(req.body.status), createdAt: new Date() })
    await order.save()

    res.status(200).json({
        status: 'Success',
        data: {
            updatedOrder: order
        }
    })
})

// Total orders
// [GET] api/v1/orders/total
// Private
// Admin && Customer
export const totalOrders = catchAsync(async (req, res) => {
    let totalOrders = 0
    // count users group by month and year
    if(req.query.month && req.query.year) {
        const {start, end} = handleDate(req.query.month, req.query.year)
        totalOrders = await Order.aggregate([
            {$match: {createdAt: {$gte: start, $lte: end } }}, 
            {
                $group: {_id: {$dateToString: {"date": "$createdAt","format": "%Y-%m"}},
                Count: {$sum: 1}}
            }
        ])
        totalOrders = totalOrders.length === 0 ? 0 : totalOrders[0].Count
    }else{ 
        totalOrders = await Order.countDocuments({})
    }
    res.status(200).json({
        status: 'Success',  
        data: {
            totalOrders
        }
    })
})

// Orders details
// [GET] api/v1/orders/:id
// Private
// Admin && cutomer
export const getOrder = catchAsync(async(req, res, next)=> {
    let order

    if(req.user.role === 'admin'){
        order = await Order.findById(req.params.id)
    }else if(req.user.role=== 'customer'){
        order = await Order.findOne({
            $and: [
                { _id: req.params.id },
                { customer: req.user.id }
            ]
        })
    }
    
    if (!order) return next(new AppError('Không tìm thấy đơn hàng', 404))

    res.status(200).json({
        status: 'Success', 
        data: {
            order
        }
    })
})

// Get all orders
// [GET] api/v1/orders, [GET] api/v1/orders/users/:id
// Private 
// Admin && customer
export const getOrders = catchAsync(async(req, res, next)=> {

    const { query, totalPage, currentPage } = await makePipelineOrder(req.query, req.user)

    const orders = await Order.aggregate(query)

    res.status(200).json({
        status: 'Success', 
        data: {
            orders: orders.length === 0 ? 'Không có đơn hàng nào' : orders, 
            totalPage,  
            currentPage
        }
    })
})