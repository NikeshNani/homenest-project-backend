const mongoose = require('mongoose')

const configureDB = async () => {
    try{
        const db = await mongoose.connect(process.env.MONGODBATLAS_URL)
        console.log('connected to db')
    }catch(e){
        console.log('error connecting to db')
    }
}
module.exports = configureDB

