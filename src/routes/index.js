import userRoutes from './userRoutes.js'
import orderRoutes from './orderRoutes.js'
import productRoutes from './productRoutes.js'
import reviewRoutes from './reviewRoutes.js'

function routes(app) {
    app.use('/api/v1/users', userRoutes)
    app.use('/api/v1/products', productRoutes)
    app.use('/api/v1/reviews', reviewRoutes)
    app.use('/api/v1/orders', orderRoutes)
}
export default routes