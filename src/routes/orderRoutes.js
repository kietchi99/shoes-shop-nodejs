import express from 'express'
const router = express.Router()
import orderController from '../controllers/orderControllers.js'

router.post('/add',orderController.addOrder)
router.put('/:id/:status/update',orderController.updateOrder)
router.get('/total',orderController.totalOrders)
router.get('/totalsaleamount',orderController.totalSaleAmount)
router.get('/:id/getbyid',orderController.getOrderById)
router.get('', orderController.getAllOrders)
router.get('/:status/getbystatus', orderController.getOrdersByStatus)
router.get('/getbyiduser', orderController.getOrdersByIdUser)

export default router