const mongoose = require('mongoose')



const DB_Connect = async(DB_URL)=>{
    try {
        await mongoose.connect(DB_URL);
        console.log("DB connected successfully");
    } catch (error) {
        console.log("Error while connecting DB",error);
    }
}

module.exports={DB_Connect}