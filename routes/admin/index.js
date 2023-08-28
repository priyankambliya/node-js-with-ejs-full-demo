const express = require("express")
const router = express.Router()

const adminController = require("../../controllers/adminController");

const passport = require('passport')
require('../../middleware/passport')(passport)

router.use(passport.initialize())
router.use(passport.session())

router.get('/login', adminController.getLogin)

router.post('/register', adminController.createAdmin)
router.post('/login', passport.authenticate('local'), adminController.loginUser)

router.get('/update-profile', adminController.updateProfile)

router.post('/update-profile', adminController.updateAdminProfile)
router.get("/all-users", adminController.AllUsers)
router.get("/posts", adminController.AllPosts)
router.post("/action", adminController.searchData)
router.post("/user-data", adminController.userData)
router.post("/success", adminController.success)
router.post("/success-post", adminController.successPost)

router.get('/profile', adminController.adminProfile)
router.get('/update', adminController.updatePassword)
router.get('/logout', adminController.logoutAdmin)
// router.post('/logout', adminController.logout)
router.post('/update-admin', adminController.updatePasswordByOldPassword)

module.exports = router