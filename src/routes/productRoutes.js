import express from 'express'
import productController from '../controllers/productControllers.js'
const router = express.Router()

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
router.post('/:id/:size/addtocart', productController.addToCart)
router.put('/:id/updatecart', productController.updateCart)
router.get('/getcart', productController.getCart)

export default router