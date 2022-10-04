import mongoose from 'mongoose'
const toId = mongoose.Types.ObjectId
import Product from '../models/product.js'
import Order from '../models/order.js'
import User from '../models/user.js'
import {currentUser, handleDate, makePipelineOrder} from '../utils/util.js'
import order from '../models/order.js'
const orderControllers = {

    //[POST] api/orders/add 
    // create a new order
    addOrder: async (req, res) => {
        try{
            const { consignee, address, phone, transportCost} = req.body
            const { user, err } = await currentUser(req.cookies.user)
            if(!user) throw  err
            let cart = await user.populate('cart.product')    
            cart = cart.cart
            const items = cart.map(item=>{
                let currentPrice = item.product.price - (item.product.price * (item.product.discount / 100))
                let subTotal = currentPrice * item.qty
                return {
                    sku: item.product.sku,
                    productName: item.product.productName,
                    quantity: item.qty,
                    size: item.size,
                    price: currentPrice,
                    subTotal,
                    transportFee
                }
            })
            const total = items.reduce((pre, curr)=>pre+curr.subTotal, 0) + transportCost
            
            const order = await Order.create({
                customer: user._id,
                consignee,
                address,
                phone,
                total,
                items,
                transportCost
            })

            res.status(200).json({status: 'Success', message: 'Thêm sản phẩm thành công', data: order})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[PUT] api/orders/:id/:status/update
    // cancel an orders 
    updateOrder: async (req, res) => {
        try{
            await Order.updateOne({id: req.params.id }, {$push: {status: {code: Number(req.params.status), createdAt: new Date()}}})
            res.status(200).json({status: 'Success', message: 'Hủy đơn hàng thành công'})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[GET] api/orders/total
    // total orders
    totalOrders: async (req, res) => {
        try{
            let totalOrders = 0
            // count users goup by month and year
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
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalOrders})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/orders/totalsaleamount
    // totalSaleAmount
    totalSaleAmount: async (req, res) => {
        try{
            let totalSaleAmount = 0 

            if(req.query.month && req.query.year) {
                const {start, end} = handleDate(req.query.month, req.query.year)
                totalSaleAmount = await Order.aggregate([
                    {$match: {createdAt: {$gte: start, $lte: end } }},
                    {
                        $group : {
                            _id : { $dateToString: {"date": "$createdAt","format": "%Y-%m"} },
                            totalSaleAmount: { $sum: { $subtract: [ "$total", "$tranportCost" ] } },
                        }
                    }
                ])
                totalSaleAmount = totalSaleAmount.length === 0 ? 0 : totalSaleAmount[0].totalSaleAmount
            }else{
                totalSaleAmount = await Order.find({})
                if(!totalSaleAmount) throw 'Error'
                totalSaleAmount = totalSaleAmount.length === 0?0:totalSaleAmount.reduce((pre, curr)=>pre+(curr.total - curr.transportCost), 0)
            }
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalSaleAmount})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/orders/:id/getbyid 
    // get an order by id
    getOrderById: async (req, res) => {
        try{
            const order = await Order.findOne({id: req.params.id})
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: order})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/orders?page 
    // get all orders with page
    getAllOrders: async (req, res) => {
        try{
            const { query, totalPage, currentPage, err } = await makePipelineOrder(req.query)
            if(err) throw 'Lỗi truy vấn cơ sở dữ liệu'
            const orders = await Order.aggregate(query)
            if(orders.length ===0 ) throw "Không có đơn hàng nào"

            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    orders, 
                    totalPage,  
                    currentPage
                }
            })
            
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },
    
    // [GET] api/orders/getbyiduser 
    // get an order by id usre
    getOrdersByIdUser: async (req, res) => {
        try{
            const { user } = await currentUser(req.cookies.user)
            const { query, totalPage, currentPage, err } = await makePipelineOrder(req.query)
            if(err) throw 'Lỗi truy vấn cơ sở dữ liệu'

            query.push({$match: {
                customer: { 
                    $elemMatch: { 
                        _id: user._id
                    }
                }
            }})

            const orders = await Order.aggregate(query)
            if(orders.length ===0 ) throw "Không có đơn hàng nào"

            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    orders, 
                    totalPage,  
                    currentPage
                }
            })

        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/orders/:month/getbystatus?page 
    // get orders by status
    getOrdersByStatus: async (req, res) => {
        try{
            const { query, totalPage, currentPage, err} = await makePipelineOrder(req.query)
            if (err) throw 'Lỗi truy vấn cơ sở dữ liệu'

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
                        "lastArrayElement.code": Number(req.params.status)
                    }
                }
            )
            const orders = await Order.aggregate(query)
            if(orders.length ===0 ) throw "Không có đơn hàng nào"

            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    orders, 
                    totalPage,  
                    currentPage
                }
            })

        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    }
}

export default orderControllers


