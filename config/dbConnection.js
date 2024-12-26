const mongoose = require("mongoose");
const connectDB = async() => {
	try
	{
		const db = process.env.MONGO_LIVE;
		//const db = process.env.MONGO_URI;
		//const db = 'mongodb://localhost:27017/SGEF';
		await mongoose.connect(db);
		console.log("MongoDB connected...");
	}
	catch(err)
	{
		console.log(err);
		process.exit(1);
	}
}

module.exports = connectDB;