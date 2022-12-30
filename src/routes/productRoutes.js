import express from 'express'
import { protect, restrictTo } from '../controllers/authControllers.js'
import {
    addProduct,
    getProductBySku,
    similarProducts,
    topBuyProducts,
    totalProducts,
    updateProduct,
    //getProducts,
    uploadProductImages,
    resizeProductImages,
    getAllProductWithPage
} from '../controllers/productControllers.js'

const router = express.Router()

// Get a product by sku
// Public
router.get('/sku/:sku', getProductBySku) 

// Get similar products
// Public
router.get('/similar/sku/:sku', similarProducts)

// Get top buy products
// Public
router.get('/topbuy', topBuyProducts)

// Total products
// Public
router.get('/total', totalProducts)

// Get all products
// Public
router.get('/', getAllProductWithPage)

// Update product
// Private
// Admin
router.patch('/:id', protect, restrictTo("admin"), uploadProductImages, resizeProductImages, updateProduct)

// Add a product
// Private
// Admin
router.post('/', protect, restrictTo("admin"), addProduct)

export default router