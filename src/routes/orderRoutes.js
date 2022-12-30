import express from 'express'
import { protect, restrictTo } from '../controllers/authControllers.js'
import {
    addOrder,
    updateOrder,
    getOrder,
    getOrders
} from '../controllers/orderControllers.js'

const router = express.Router()

// Add a order
// Private
// Cutomer
router.post('/', restrictTo("customer"), addOrder)

// Update order
// Private
// Admin && customer
router.patch('/:id', protect,  restrictTo("customer", "admin"), updateOrder)

// Order details
// Private
// Admin && customer
router.get('/:id', protect,  restrictTo("customer", "admin"), getOrder)

// Get orders by customer id
// Private
// Customer
router.get('/users/:id', protect,  restrictTo("customer"), getOrders)

//All orders
// Private
//Admin
router.get('/', protect,  restrictTo("admin"), getOrders)


//Total orders
// Private
//Admin


export default router