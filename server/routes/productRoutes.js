import express from 'express'
const router = express.Router()
import productController from '../controllers/productControllers.js'

router.post('/add', productController.addProduct)
router.get('/:category/getbycategory', productController.getProductByCategory)
router.get('/:sku/getbysku', productController.getProductBySku)
router.get('', productController.getAllProductWithPage)
router.get('/:sku/similar', productController.productSimilar)
router.get('/discount', productController.getDiscountProduct)
router.get('/total', productController.totalProducts)
router.get('/topbuy', productController.getTopBuyProducts)
router.put('/:id/edit', productController.updateProduct)
router.get('/nodiscount', productController.getNoDiscountProducts)
router.put('/updateDiscount', productController.updateDiscount)
router.put('/updateAvatar', productController.updateAvatar)
router.put('/updateImages', productController.updateImages)


export default router