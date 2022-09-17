import userRoutes from './userRoutes.js'
//import orderRoutes from './routes/orderRoutes.js'
//import productRoutes from './routes/productRoutes.js'
//import reviewRoutes from './routes/reviewRoutes.js'

function routes(app) {

    app.use('/api/users', userRoutes)
    //app.use('/api/products')
    //app.use('/api/orders')
    //app.use('/api/reviews')
}
export default routes