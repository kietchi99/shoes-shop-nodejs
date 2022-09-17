
const productControllers = {

    // [GET] api/products/:id/getbyid 
    // get a product by id
    getUserById: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data:''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/:category/getbycategory 
    // get a product by category 
    getAllusers: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/:slug/getbyslug 
    // get a product by slug
    signUp: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products?page 
    // get all products by page
    signIn: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/discount 
    // get dicount products
    updateProfile: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/betseller 
    // get bestseller products
    updatePassword: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[POST] api/products/add 
    // create a new product
    forgotPassword: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    //[PUT] api/products/:id/edit 
    // update a product
    updateUser: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/total 
    // total products
    totalUsers: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    },

    // [GET] api/products/totalbymonth 
    // total products by month 
    totalUsersByMonth: (req, res) => {
        try{
            //throw new Error('')
            res.status(200).json({status: '', message: '', data: ''})
        }catch(err){
            res.status(500).json({status: '', message: ''})
        }
    }
}

export default productControllers