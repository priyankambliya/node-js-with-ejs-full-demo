const express = require("express")
const router = express.Router()

const postController = require("../../controllers/postController")

const validator = require("../../utils/validateRequest")

router.post("/create", validator("createpost"), postController.createPost)
router.put("/update", validator("updatepost"), postController.updatePost)
router.delete("/delete", postController.deletePost)


router.get("/all-post", postController.allPost)
router.get("/post", postController.getPostByLoginUser)

module.exports = router