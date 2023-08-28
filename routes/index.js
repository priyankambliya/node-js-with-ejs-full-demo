const express = require("express")
const router = express.Router()

const userRoutes = require("../routes/user/index")
const postRoutes = require("../routes/post/index")
const adminRoutes = require("./admin/index")

const auth = require("../middleware/jwtAuth")

router.use("/user", userRoutes)
router.use("/post", auth, postRoutes)
router.use("/admin", adminRoutes)

module.exports = router