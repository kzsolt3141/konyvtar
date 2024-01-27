const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const db_users = require("./db_users");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    console.log("Authenticating", email, password, done);
    const user = await db_users.getUserByEmail(email);
    if (user == null) {
      return done(null, false, { message: "No user with that email" });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    const user = await db_users.getUserById(id);
    return done(null, user);
  });
}

module.exports = {
  initialize,
};
