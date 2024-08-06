const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	code: { type: String,  default: null },
	name: { type: String, required: true },
	mobile_no: { type: Number,  },
	email_id: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true },
	dateOfJoining: { type: Date,  },
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
userSchema.methods.calculateLifetimeCycleNumber = function() {
const dateOfJoining = this.dateOfJoining;
const currentDate = new Date();
const diffTime = Math.abs(currentDate - dateOfJoining);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
this.consultantLifetimeCycleNumber = Math.ceil(diffDays / 60);
};

userSchema.pre('save', function(next) {
this.calculateLifetimeCycleNumber();
next();
});

const User = mongoose.model("users", userSchema);
module.exports = User;