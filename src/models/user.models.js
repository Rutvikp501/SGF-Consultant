const { default: mongoose } = require("mongoose");


const UserSchema = new mongoose.Schema(
    {
        code: { type: String, unique: true, default: null },
        name: { type: String, required: true },
        mobile_no: { type: Number, required: true },
        email_id: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: false },
        dateOfJoining: { type: Date, required: true },
        cycle: {
            label: { type: String },
            number: { type: Number }
        },
        consultantLifetimeCycleNumber: { type: Number },
        leadsPerCycle: { 
            seasonal: { type: Map, of: Number, default: new Map() },
            regular: { type: Map, of: Number, default: new Map() }
        },
        otp: { type: String, default: null },
        otpExpires: { type: Date, default: null },
    }, { timestamps: true }
);
UserSchema.methods.calculateLifetimeCycleNumber = function() {
    const dateOfJoining = this.dateOfJoining;
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - dateOfJoining);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.consultantLifetimeCycleNumber = Math.ceil(diffDays / 60);
};

UserSchema.pre('save', function(next) {
    this.calculateLifetimeCycleNumber();
    next();
});
module.exports = mongoose.model('users', UserSchema)
// PORT = 3333
// DB_URL='mongodb+srv://patilrutvik501:patilrutvik501@smallprojects.1bzonhg.mongodb.net/?retryWrites=true&w=majority'
// token="R@U#V$I%K&",