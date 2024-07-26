const { default: mongoose } = require("mongoose");


const AdviserSchema= new  mongoose.Schema(
    {
        Adviser_code: { type: String, required: true, unique: true },
        Adviser_name: { type: String, required: true },
        mobile_no: { type: Number, required: true },
        email_id: { type: String,unique: true },
        password: { type: String, required: true },
    }
)
module.exports=mongoose.model('advisers',AdviserSchema)
// PORT = 3333 
// DB_URL='mongodb+srv://patilrutvik501:patilrutvik501@smallprojects.1bzonhg.mongodb.net/?retryWrites=true&w=majority'
// token="R@U#V$I%K&",