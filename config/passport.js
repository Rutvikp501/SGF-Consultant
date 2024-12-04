const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const adminModel = require("../models/admin.model");
const Consultant = require("../models/user");
module.exports = function (passport) {
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email_id", passwordField: "password" },
      async (email_id, password, done) => {
        try {
          // Try to find the user as admin first
          let user = await adminModel.findOne({ email_id: email_id });
          // If neither admin nor consultant found
          if (!user) {
            return done(null, false, { message: "The email is not registered" });
          }

          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Password incorrect" });
          }

          // Successful authentication
          return done(null, user, { message: "Logged in successfully" });
        } catch (err) {
          console.error(err);
          return done(err);
        }
      }
    )
  );

  // Serialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id, done) => {
    try {
      // Try to find the user as admin first
      let user = await adminModel.findById(id);

      // If not found as admin, check if user is a consultant
      if (!user) {
        user = await Consultant.findById(id);
      }

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
