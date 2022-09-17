
const orderControllers = {

    // [GET] api/orders/:id/getbyid 
    // get an order by id
    getUserById: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data:''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/orders/:month/getbymonth?page 
    // get orders by month
    getAllusers: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/orders?page 
    // get all orders by page
    signUp: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[POST] api/orders/add 
    // create a new order
    signIn: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[PUT] api/orders/:id/cancel 
    // cancel an orders 
    updateProfile: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[PUT] api/orders/:id/change-status 
    // update status an orders 
    updatePassword: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[GET] api/orders/total 
    // total orders
    forgotPassword: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[GET] api/orders/totalbymonth 
    // total orders by month
    updateUser: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/orders/revenuebymonth 
    // Revenue in month
    totalUsers: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/orders/revenue
    // Revenue
    totalUsersByMonth: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    }
}

export default orderControllers