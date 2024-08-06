const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const User = require("../models/user.models.js");

module.exports = function(passport) {
	console.log();
	
	passport.use( "local",
		new LocalStrategy({ usernameField: 'email_id', passwordField: 'password'}, (email_id, password, done) => {
			User.findOne({ email_id: email_id })
				.then(user => {
					if(!user)
						return done(null, false, { message: "The email is not registered" });
					
					bcrypt.compare(password, user.password, (err, isMatch) => {
						if(err)	throw err;
						if(!isMatch)
							return done(null, false, {message: "Password incorrect"});
						else
							return done(null, user, { message: "Logged in successfully" });
					})
				})
				.catch(err => console.log(err));
		})
	);
	
	
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});
	
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});
	
}

