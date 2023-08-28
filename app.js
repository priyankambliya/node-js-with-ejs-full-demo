require("dotenv").config()
require("./config/db")

const express = require("express")
const multer = require("multer")
const cookie = require("cookie-parser")
const chalk = require("chalk")
const session = require('express-session')

const app = express()

const router = require("./routes/index")

// ================ MULTER STORAGE ================= // 
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {  // do not use file name that contain ":"(colon) in name
        cb(null, new Date().getTime() + '_' + file.originalname);
    }
})

app.use(multer({ storage: fileStorage }).single('image'))

// ================ VIEW ENGINE ================= // 
app.set("view engine", "ejs")

// ================ For serve image into browser ================= // 
app.use(cookie())
app.use(express.json())
app.use(express.static('public'))
app.use('/images', express.static(__dirname + '/images'));
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use('/api', router)

app.listen(process.env.PORT, () => {
    console.log(chalk.blueBright(`site listning on port: ${process.env.PORT}`))
})