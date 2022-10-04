import mongoose from 'mongoose'
import Product from '../models/product.js'
import Review from '../models/review.js'
import User from '../models/user.js'
import { makePipelineProduct, handleColor, handleSize, currentUser ,decoded, handleDate} from '../utils/util.js'

const toId = mongoose.Types.ObjectId

const productControllers = {

    // [GET] api/products/:category/getbycategory 
    // get a product by category 
    getProductByCategory: async (req, res) => {
        try{
            let query = [
                { $match: { categories: req.params.category}}
            ]
            const result = await makePipelineProduct(query, req.query)
            if(result.err) throw 'Lỗi truy vấn cơ sở dữ liệu' 
            const products = await Product.aggregate(result.query)
            if (products.length === 0) res.status(200).json({status: 'Success', message: 'Không có sản phẩm nào'})
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    products, 
                    totalPage: result.totalPage,  
                    currentPage: result.currentPage
                }
            })
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/:sku/getbysku 
    // get a product by sku
    getProductBySku: async (req, res) => {
        try{
            const product = await Product.findOne({sku: req.params.sku})
                .populate(
                    {
                        path: 'reviews', 
                        model: Review,
                        select: ['title', 'content', 'star', 'user', 'createdAt'],
                        populate: {
                            path: 'user',
                            Model: User
                        }
                    } 
                )
            if (!product) throw "Không tìm thấy sản phẩm"
            res.header("Access-Control-Allow-Origin", "*")
            res.status(200).json({status: 'Success', message: 'Lấy sản phẩm thành công', data: product})
        }catch(err){
            console.log(err)
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
            //total
            let total = 0
            for (const key in sizes) {
                total += sizes[key]
            }
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
                currentPrice: price,
                total
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
            if (sort && sort!=='Mặc định') {
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
                        currentPrice: (sort === 'asc')?1:-1
                    } }
                )
            }
            //Tạo query pagination và filter and search 
            const result = await makePipelineProduct(query, req.query)
            if(result.err) throw 'Lỗi truy vấn cơ sở dữ liệu' 
            const products = await Product.aggregate(result.query)
            
            if(products.length ===0) throw "Không tìm thấy sản phẩm"
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    products, 
                    totalPage: result.totalPage,  
                    currentPage: result.currentPage
                }
            })
        }catch(err){
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
            res.header("Access-Control-Allow-Origin", "*")
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
            const result = await makePipelineProduct(query, req.query )

            const products = await Product.aggregate(result.query)
            if (products.length === 0) res.status(200).json({status: 'Success', message: 'Không có sản phẩm nào'})
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {
                    products, 
                    totalPage: result.totalPage,  
                    currentPage: result.currentPage
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
            if(req.query.month && req.query.year) {
                const {start, end} = handleDate(req.query.month, req.query.year)
                totalProducts = await Product.aggregate([
                    {$match: {createdAt: {$gte: start, $lte: end } }}, 
                    {
                        $group: {_id: {$dateToString: {"date": "$createdAt","format": "%Y-%m"}},
                        Count: {$sum: 1}}
                    }
                ])
                totalProducts = totalProducts.length === 0 ? 0 : totalProducts[0].Count
            }else{ 
                totalProducts = await Product.countDocuments({})
            }
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: totalProducts})
        }catch(err){
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    // [GET] api/products/topbuy
    // get top buy products
    getTopBuyProducts: async (req, res) => {
        try{
            const products = await Product.aggregate([
                { $sort : { sold : -1 }},
                { $limit: 6}
                
            ])
            if (products.length === 0) res.status(200).json({status: 'Success', message: 'Không có sản phẩm nào'})
            res.status(200).json({
                status: 'Success', 
                message: 'Lấy dữ liệu thành công', 
                data: {products}
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
        //total
        let total = 0
        for (const key in sizes) {
            total += sizes[key]
        }
        console.log(total)
        try{
            await Product.updateOne(
                { id }, 
                { 
                    productName, 
                    brand,
                    sku,
                    categories: ['male', 'female'],
                    describe,
                    discount,
                    price,
                    status,
                    color,
                    sizes,
                    total
                }) 

            res.status(200).json({status: 'Success', message: 'Cập nhật thành công'})
        }catch(err){
            res.status(500).json({status: 'Error', message: err})
        }
    },

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
    },

    //add to cart
    addToCart: async (req, res) => {
        let {id, size} = req.params
        try{
            const { user } = await currentUser(req.cookies.user)
            let cart = []
            let index = 0
            if (user) {// trường đăng nhập
                cart = user.cart
                index = cart.findIndex(item => item.product.equals(id) && item.size===size)
            }else {//chưa đăng nhập
                if(!req.session.cart) req.session.cart = []
                cart = req.session.cart
                index = cart.findIndex(item => item.product === id && item.size === size)
            }
            if (cart.length > 0){
                if (index === -1) {// Trường hợp cart có item nhưng không trùng
                    cart.push({ 
                        size,
                        product: id,
                        qty: 1
                    })
                }else{//Trường hợp trùng item
                    cart[index].qty++
                }
            }else {//Trường hợp cart không có item
                cart.push({ 
                    size, 
                    product: id,
                    qty: 1
                })
            }
            if(user) await User.updateOne( { _id: user.id }, {cart}) 
            res.status(200).json({status: 'Success', message: 'Thêm giỏ hàng thành công'})
        }catch (err) {
            console.log (err)
            res.status(500).json({status: 'Error', message: err})
        }
    },

    //update cart
    //[PUT] api/products/:id/updatecart
    updateCart: async (req, res) => {
        try{
            const id  = req.params.id
            const { size, action } = req.query
            const { user } = await currentUser(req.cookies.user)

            if(user) {// Trường hợp đăng nhập
                const cart = user.cart
                const item = cart.find(item => item.product.equals(id) && item.size===size)
                if(action === 'add') item.qty++
                else if (action === 'subtract') item.qty--
                else if (action ==='remove') {
                    const index = cart.findIndex(item => item.product.equals(id) && item.size===size)
                    cart.splice(index, 1)
                }
                else throw "hành động không hợp lệ"
                user.save()
            }else { // Trường không hợp đăng nhập
                const cart = req.session.cart
                const index = cart.findIndex(item => item.product===id && item.size===size)
                if(action === 'add') {cart[index].qty++; console.log(cart)}
                else if (action === 'subtract') cart[index].qty--
                else if (action === 'remove') cart.splice(index, 1)
                else throw "hành động không hợp lệ"
                res.status(200).json({status: 'Success', message: 'cập nhật thành công', data: cart})
            }
        }catch(err) {
            console.log(err)
            res.status(500).json({status: 'Error', message: err})
        }  
    },

    //get cart
    //[GET] api/products/getcart
    getCart: async (req, res) => {
        try{
            const {id} = decoded(req.cookies.user)
            let cart = []
            if(id) {
                    const user = await User.findOne({id}).populate('cart.product')
                    cart = user.cart.map(item=>{
                        let currentPrice = item.product.price - (item.product.price * (item.product.discount / 100))
                        let subTotal = currentPrice * item.qty
                        return {
                            productName: item.product.productName,
                            quantity: item.qty,
                            size: item.size,
                            price: currentPrice,
                            subTotal
                        }
                    })
            }else{
                cart = req.session.cart
                const ids = cart.map(item => toId(item.product))
                const products = await Product.find({_id: {$in: ids}})
                cart = cart.map(item => {
                    let product = products.find(product => product.id===item.product)
                    let currentPrice = product.price - (product.price * (product.discount / 100))
                    let subTotal = currentPrice * item.qty
                    return {
                        productName: product.productName,
                        quantity: item.qty,
                        size: item.size,
                        price: currentPrice,
                        subTotal
                    }
                })
            }
            res.status(200).json({status: 'Success', message: 'Lấy dữ liệu thành công', data: cart})
        }catch(err){ 
            console.log(err)  
            res.status(500).json({status: 'Error', message: err})
        } 
    }

}

export default productControllers