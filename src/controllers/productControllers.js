import multer from 'multer'
import sharp from 'sharp'
import catchAsync from '../utils/catchAsync.js'
import Product from '../models/product.js'
import { 
    makePipelineProduct, 
    handleDate,
    handleInputProduct,
    filterObj
} from '../utils/index.js'

//setup multer - upload images
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }else {
        cb(new AppError('Không phải hình ảnh', 400), false)
    }
}

const upload = multer({
    storage: multerStorage, 
    fileFilter: multerFilter
})

export const uploadProductImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 6 }
])

// resize image
export const resizeProductImages = catchAsync(async(req, res, next) => {
    if(!req.files.imageCover && !req.files.images) return next()

    if(req.files.imageCover){
        req.body.imageCover = `product-${req.params.id}-${Date.now()}-cover.jpeg`
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`src/public/img/products/${req.body.imageCover}`)
    }

    if (req.files.images) {
        req.body.images = []
        await Promise.all(
            req.files.images.map(async(file, i)=>{
                const filename = `product-${req.params.id}-${Date.now()}-${i+0}.jpeg`
                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`src/public/img/products/${filename}`)
                req.body.images.push(filename)
            })
        )
    }
    next()
})

// Get product by sku
// [GET] api/v1/products/sku/:sku
// Public
export const getProductBySku = catchAsync(async (req, res) => {
    const product = await Product.findOne({ sku: req.params.sku })

    if (!product) return next(new AppError('Không tìm thấy sản phẩm này', 404)) 

    res.status(200).json({
        status: 'Success', 
        data: {
            product
        }
    })
})

// Add a new product
// [POST] api/v1/products
// private
// Admin
export const addProduct = catchAsync(async (req, res) => {
    const dataset = handleInputProduct(req.body)
    
    const newProduct = await Product.create(dataset)

    res.status(201).json({
        status: 'Success',
        data: {
            product: newProduct
        }
    })
})

// Get all products
// [GET] api/products
// Public
export const getAllProductWithPage = catchAsync(async (req, res) => {
    
    //Tạo query pagination và filter and search 
    const result = await makePipelineProduct(req.query)
    if(result.err) next (err)

    const products = await Product.aggregate(result.query)
    if(products.length ===0) throw "Không tìm thấy sản phẩm"

    res.status(200).json({
        status: 'Success', 
        data: {
            products, 
            totalPage: result.totalPage,  
            currentPage: result.currentPage
        }
    })
})

// Get similar products
// [GET] api/v1/products/similar/sku/:sku
// Public
export const similarProducts = catchAsync(async (req, res) => {
    let listProduct
    const sku = req.params.sku
    
    const keyword = sku.slice(0, sku.indexOf('-') + 1 )

    let products = await Product.find({ sku: { $regex: keyword } })

    if(!products) return next(new AppError('Không tìm thấy sản phẩm', 404))

    if(products) listProduct = products.filter(product => product.sku !== sku)

    res.status(200).json({
        status: 'Success', 
        data: {
            products
        }
    })
})

// Total products
// [GET] api/v1/products/total
// Public
export const totalProducts = catchAsync(async (req, res) => {
    let totalProducts = 0
    if(req.query.month && req.query.year) {
        const { start, end } = handleDate(req.query.month, req.query.year)
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
    res.status(200).json({
        status: 'Success', 
        data: {
            totalProducts
        }
    })
})

// Top buy products
// [GET] api/v1/products/topbuy
// Public
export const topBuyProducts = catchAsync(async (req, res) => {
    const products = await Product.aggregate([
        { $sort : { sold : -1 }},
        { $limit: 6}
    ])
    res.status(200).json({
        status: 'Success', 
        data: {
            products: products.length === 0 ? 'Không có sản phẩm nào' : products
        }
    })
})

// Update a product
// [PATCH] api/products/:id
// Private
// Admin
export const updateProduct = catchAsync(async (req, res) => {
    let dataset = handleInputProduct(req.body)
    dataset = filterObj(
        dataset, 
        'productName', 
        'sku', 
        'brand', 
        'status',
        'describe',
        'color', 
        'imageCover', 
        'images', 
        'categories', 
        'price', 
        'sold', 
        'amount', 
        'discount', 
        'sizes'
    )
    const updatedProduct = await Product.findByIdAndUpdate( req.params.id , dataset, {
        new: true,
        runValidators: true
    }) 

    res.status(200).json({
        status: 'Success', 
        data: {
            updatedProduct
        }
    })
})

// Get all products
// [GET] api/products
// Private
// Admin
export const getProducts = catchAsync(async(req, res, next)=> {
    const { query, totalPage, currentPage, err } = await makePipelineProduct(req.query)
    if(err) return next(err)

    const products = await Product.aggregate(query)

    res.status(200).json({
        status: 'Success', 
        data: {
            products: products.length === 0 ? 'Không có sản phẩm nào': products, 
            totalPage,  
            currentPage
        }
    })
})