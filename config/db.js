const mongoose = require("mongoose")
const chalk = require("chalk")

mongoose.connect(process.env.CONNECTION_URL).then(() => {
    console.log(chalk.blueBright(`Database connection established...`))
}).catch((err) => {
    console.log(err.message)
})