
// [GET] api/user/:id/getbyid  || get a user by id

const getUserById = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

// [GET] api/user?page || get all users by page || admin

const getAllusers = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[POST] api/user/sign-up || create a new user

const signUp = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[POST] api/user/sign-in || sign in 

const signIn = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[PUT] api/user/profile/:id/edit || update profile

const updateProfile = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[PUT] api/user/profile/:id/change-password || update password

const updatePassword = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[PUT] api/user/profile/forgot-password || fogot password

const forgotPassword = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

//[PUT] api/user/:id/edit || update a user  || admin

const updateUser = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

// [GET] || api/user/total || total users

const totalUsers = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}
// [GET] || api/user/totalbymonth || total users by month

const totalUsersByMonth = (req, res) => {
    try{
        //throw new Error('')
        res.status(200).json({status: '', message: ''})
    }catch(err){
        res.status(500).json({status: '', message: ''})
    }
}

export {
    getUserById,
    getAllusers,
    signUp,
    signIn,
    updateProfile,
    updatePassword,
    forgotPassword,
    updateUser,
    totalUsers,
    totalUsersByMonth
}