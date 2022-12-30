import Review from '../models/review.js'
import { makePipelineReview } from '../utils/index.js'
import AppError from '../utils/appError.js'
import catchAsync from '../utils/catchAsync.js'

// Get all reviews
// [GET] api/v1/reviews
// Private
// Admin
export const getAllReviews = catchAsync(async (req, res) => {
    const { query, totalPage, currentPage } = await makePipelineReview(req.query)

    const reviews = await Review.aggregate(query)

    res.status(200).json({
        status: 'Success', 
        data: {
            reviews: reviews.length===0 ? 'Chưa có đánh giá nào' : reviews, 
            totalPage,  
            currentPage
        }
    })
})


// Update a review
// [PATCH] api/reviews/:id 
// Private
// Customer
export const updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findOneAndUpdate( 
        {
            $and:[
                { _id: req.params.id },
                { user: req.user.id }
            ]
        }, 
        req.body, 
        { new: true }
    )

    if(!review) return next(new AppError('Không tìm thấy đánh giá', 404))
    
    res.status(200).json({
        status: 'Success', 
        data: {
            review
        }
    })
})

// Add a new review
// [POST] api/v1/reviews/:id
// Private
// Customer
export const addReview = catchAsync(async (req, res) => {
    const newReview = await Review.create( { 
        ...req.body,
        product: req.params.id, 
        user: req.user.id 
    })

    res.status(201).json({
        status: 'Success', 
        data: {
            newReview
        }
    })
})

// [DELETE] api/v1/reviews/:id
// Delete a review
// Private
// Customer
export const deleteReview = catchAsync(async (req, res) => {
    let deletedReview
    if(req.user.role === 'admin') {
        deletedReview = await Review.findByIdAndDelete(req.params.id)
    }else if (req.user.role === 'customer') {
        deletedReview = await Review.findOneAndDelete({
            $and: [
                { _id: req.params.id },
                { user: req.user.id }
            ]
        })
    }

    if(!deletedReview) return next(new AppError('Không tìm thấy đánh giá', 404))
    
    res.status(200).json({ 
        status: 'Success',
        data: {
            deletedReview
        }
    })
})