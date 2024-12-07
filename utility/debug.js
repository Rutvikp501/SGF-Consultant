const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user'); // Ensure the path to your User model is correct

passport.use(new LocalStrategy(
	{ usernameField: 'email_id' },
	async (email_id, password, done) => {
		try {
			const user = await User.findOne({ email_id });
			if (!user) {
				return done(null, false, { message: 'Incorrect email.' });
			}
			const isMatch = await user.comparePassword(password); // Ensure your User model has a comparePassword method
			if (!isMatch) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	}
));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});
exports.authenticateUser = async(email_id, password)=> {
	console.log(email_id, password);
	try {
	  const user = await User.findOne({ email_id });
	  
	  if (!user) {
		return { error: 'Incorrect email.' };
	  }
	  const isMatch = await user.comparePassword(password); // Ensure your User model has a comparePassword method
	  if (!isMatch) {
		return { error: 'Incorrect password.' };
	  }
	  return { user };
	} catch (err) {
	  return { error: 'Authentication error.' };
	}
  }