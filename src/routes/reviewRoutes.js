import express from 'express'
import {
    getAllReviews,
    updateReview,
    addReview,
    deleteReview
} from '../controllers/reviewControllers.js'
import { protect, restrictTo } from '../controllers/authControllers.js'

const router = express.Router()

// Add a review
// Private
// Customer
router.post('/products/:id', protect, restrictTo("customer"), addReview)

// Update review
// Private
// Customer
router.patch('/:id', protect, restrictTo("customer"), updateReview)

// Get all reviews
// Private
// Admin
router.get('/', protect, restrictTo("admin"), getAllReviews)

// delete review
// Private
// Admin && customer
router.delete('/:id', protect, restrictTo("admin", "customer"), deleteReview)



export default router