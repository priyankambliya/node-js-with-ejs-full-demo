const express = require("express")
const router = express.Router()

const userController = require("../../controllers/userController")

const validator = require("../../utils/validateRequest")
const auth = require("../../middleware/jwtAuth")

router.get("/success", userController.getUser)
router.get("/logout", auth, userController.logout)

router.post("/create", validator('register'), userController.createUser)
router.post("/verify", userController.verifyOtp)
router.post("/resent", userController.resendOtp)
router.post("/login", validator('login'), userController.loginUser)

router.put("/update", auth, validator('update'), userController.updateUser)

router.patch("/update-password", auth, validator("pass"), userController.updateUserPassword)
router.patch("/forgot-password/:id", validator('forgotPass'), userController.forgotPassword)

router.delete("/delete", auth, userController.deleteUser)
module.exports = router