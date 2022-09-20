import userRoutes from './userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import productRoutes from './productRoutes.js'
import reviewRoutes from './reviewRoutes.js'

function routes(app) {

    app.use('/api/users', userRoutes)
    app.use('/api/products', productRoutes)
    app.use('/api/reviews', reviewRoutes)
    app.use('/api/orders', orderRoutes)
    
}
export default routes