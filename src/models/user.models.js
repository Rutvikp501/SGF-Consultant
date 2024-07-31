const { default: mongoose } = require("mongoose");


const UserSchema = new mongoose.Schema(
    {
        code: { type: String, unique: true ,default: null},
        name: { type: String, required: true },
        mobile_no: { type: Number, required: true },
        email_id: { type: String,  required: true ,unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        dateOfJoining: { type: Date, },
        cycle: {
            label: { type: String },
            number: { type: Number }
        },
        otp: { type: String ,default: null},
        otpExpires: { type: Date,default: null },
    }, { timestamps: true }
)
module.exports = mongoose.model('users', UserSchema)
// PORT = 3333
// DB_URL='mongodb+srv://patilrutvik501:patilrutvik501@smallprojects.1bzonhg.mongodb.net/?retryWrites=true&w=majority'
// token="R@U#V$I%K&",