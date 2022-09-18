
import Product from '../models/product.js'
import { makePipeline, handleColor, handleSize } from '../utils/util.js'

const productControllers = {

    // [GET] api/products/:category/getbycategory 
    // get a product by category 
    getProductByCategory: async (req, res) => {
        try{
            const products = await Product.find({categories: req.params.category})
            if (!products) throw "Không tìm thấy sản phẩm"
            res.status(200).json({status: 'Success', message: 'Lấy danh sách sản phẩm thành công', data: products})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/:sku/getbysku 
    // get a product by sku
    getProductBySku: async (req, res) => {
        try{
            const products = await Product.find({sku: req.params.sku})
            if (!products) throw "Không tìm thấy sản phẩm"
            res.status(200).json({status: 'Success', message: 'Lấy sản phẩm thành công', data: products})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //[POST] api/products/add 
    // create a new product
    addProduct: async (req, res) => {
        const { sku, productName, brand, describe, categories, price} = req.body
        try{
            const duplicateModel = await Product.findOne( { sku } )
            if (duplicateModel) throw "Sản phẩm đã tồn tại trong kho"
            //handle images, avatar
            let images = req.files
            images = images.map((image)=>image.filename)
            const avatar = images[0]
            //handle color
            const color = handleColor(sku)
            //handle sizes
            const sizes = handleSize(req.body)
            
            const product = await Product.create({ 
                productName,
                brand,
                describe,
                sku, 
                images, 
                avatar, 
                sizes, 
                categories, 
                color, 
                price,
                currentPrice: price
            })
            res.status(200).json({status: 'Success', message: 'Thêm sản phẩm thành công', data: product})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products?page 
    // get all products with page
    getAllProductWithPage: async (req, res) => {
        try {
            let sort = req.query.sort
            let query = []
            // sort 
            if (sort) {
                query.push(
                    {$project: {
                        productName: 1, 
                        sku: 1,
                        brand: 1,
                        status: 1,
                        categories: 1,
                        avatar: 1,
                        price: 1,
                        discount: 1,
                        sold: 1,
                        currentPrice: { $subtract: ['$price', {$multiply: ['$price', {$divide: ['$discount', 100] }]} ] }
                    }}, 
                    { $sort: {
                        productName: 1,
                        currentPrice: (sort.slice(sort.indexOf('|') + 1 ) === 'asc')?1:-1
                    } }
                )
            }
            //Tạo query pagination và filter and search 
            const result = await makePipeline(query, req.query )

            const products = await Product.aggregate(result.query)
            if(products.length ===0) throw "Không tìm thấy sản phẩm"
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    products, 
                    totalPage: result.totalPage,  
                    currentPage: result.page
                }
            })
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/similar
    // get similar products
    productSimilar: async (req, res) => {
        const sku = req.params.sku
        try{
            const keyword = sku.slice(0, sku.indexOf('-') +1 ) // Lấy mã sản phẩm
            let products = await Product.find({sku: {$regex: keyword}})
            if(products) products = products.filter(product => product.sku !== sku)
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: products})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/discount 
    // get dicount products
    getDiscountProduct: async (req, res) => {
        try{
            let query = [
                { $sort: { discount : -1 }},
                { $match: { discount: {$gt: 0}}}
            ]
            
            //Tạo query pagination và filter and search 
            const result = await makePipeline(query, req.query )

            const discountProducts = await Product.aggregate(result.query)
            if (discountProducts.length === 0) res.status(200).json({status: 'Success', message: 'Không có sản phẩm nào'})
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    discountProducts, 
                    totalPage: result.totalPage,  
                    currentPage: result.page
                }
            })
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/total 
    // total products
    totalProducts: async (req, res) => {
        try{
            let totalProducts = 0
            // count users goup by month and year
            if(req.query.month && req.query.year) {
                totalProducts = await Product.aggregate([{$match: {}}, {$group: {id: {$dateToString: {"date": "$createdAt","format": "%Y-%m"}},Count: {$sum: 1},}}])
                totalProducts = totalProducts[0].Count
            //count all users
            }else{ 
                totalProducts = await Product.countDocuments({})
            }
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalProducts})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/topbuy
    // get top buy products
    getTopBuyProducts: async (req, res) => {
        try{
            let query = [
                { $sort : { sold : -1 }}
            ]

            //Tạo query pagination và filter and search 
            const result = await makePipeline(query, req.query )

            query = result.query
            const totalPage = result.totalPage
            const page = result.page

            const TopBuyProducts = await Product.aggregate(query)
            if (TopBuyProducts.length === 0) res.status(200).json({status: 'Success', message: 'Không có sản phẩm nào'})
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    TopBuyProducts, 
                    totalPage,  
                    currentPage: page
                }
            })
        }catch(err){
            console.log(err)
            //res.status(500).json({status: '', message: ''})
        }
    },

    // update a product
    //[PUT] api/products/:id/edit 
    updateProduct: async (req, res) => {
        const id = req.params.id
        const { productName, brand, sku, categories, describe, discount, price, status } = req.body
        //handle color
        const color = handleColor(sku)
        //handle size
        const sizes = handleSize(req.body)
        try{
            await Product.updateOne(
                { id }, 
                { 
                    productName, 
                    brand,
                    sku,
                    categories,
                    describe,
                    discount,
                    price,
                    status,
                    color,
                    sizes
                }) 

            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //get all products
    //[GET] api/products/nodiscount 
    getNoDiscountProducts: async (req, res) => {
        try{
            const products = await Product.find({ discount: 0 })
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: products})
        }
        catch (err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // update giam gia
    //[PUT] api/products/updateDiscount
    updateDiscount: async (req, res) => {
        try{
            await Product.updateMany({sku: {$in: req.body.products }}, {discount: req.body.discount})
            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }
        catch (err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // update anh dai dien
    updateAvatar: async (req, res) => {
        try {
            await Product.updateOne({ sku: req.params.sku }, {avatar: req.file.filename })
            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }catch(err) {
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // update album anh
    updateImages: async (req, res) => {
        try {
            let images = req.files
            images = images.map((image)=>image.filename)

            await Product.updateOne({ sku: req.params.sku }, {images})
            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }catch(err) {
            res.status(500).json({status: 'Error', message: err})
        }
    }

}

export default productControllers