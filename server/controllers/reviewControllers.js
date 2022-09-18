import mongoose from 'mongoose'
import Product from '../models/product.js'
import Review from '../models/review.js'
import User from '../models/user.js'
import { makePipelineReview } from '../utils/util.js'

const reviewControllers = {

    // [GET] api/reviews?page&&search
    // get all reviews by page
    getAllReviews: async (req, res) => {
        try{
            const { query, totalPage, page } = await makePipelineReview(req.query)
            console.log(query)
            const reviews = await Review.aggregate(query)
            if(reviews.length ===0) throw "Không có đánh giá nào"

            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    reviews, 
                    totalPage: totalPage,  
                    currentPage: page
                }
            })
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[PUT] api/reviews/:id/update 
    // update a review
    updateReview: async (req, res) => {
        try{
            await Review.updateOne({id: req.params.id}, {status: req.body.status})
            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[POST] api/reviews/:id/add 
    // create a new review
    addReview: async (req, res) => {
        const { title, star, content } = req.body
        const toId = mongoose.Types.ObjectId
        try{
            //const user = User.getUser(req.cookies.user)
            const user = '63252cab9c0f99cf8479900b'
            const idUser = toId(user)
            const review = await Review.create( { 
                title, 
                star, 
                content, 
                product: req.params.id, 
                user: idUser 
            })
            await Product.updateOne({ _id: req.params.id }, {$push: { reviews: review.id } })
            res.status(200).json({status: 'Success', message: 'Thêm đánh giá thành công'})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[DELETE] api/reviews/:id/remove
    // remove a review
    removeReview: async (req, res) => {
        try{
            await Review.deleteOne({id: req.params.id})
            res.status(200).json({status: 'Success', message: 'Xóa đánh giá thành công'})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/review/:status/getbystatus 
    // get a review by status

    getReviewByStatus: async (req, res) => {
        try{
            const { query, totalPage, page } = await makePipelineReview(req.query)
            query.push({$match: {status: Number(req.params.status)}})
            console.log(query)
            const reviews = await Review.aggregate(query)
            if(reviews.length ===0) throw "Không có đánh giá nào"

            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    reviews, 
                    totalPage: totalPage,  
                    currentPage: page
                }
            })
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }   
    }

    
}

export default reviewControllers