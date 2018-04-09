const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');


module.exports = (passport) => {
  // Local Strategy
  passport.use(new LocalStrategy((username, password, done) => {
    // Match Username
    var query = {username: username};
    User.findOne(query, (err, user) => {
      if(err) throw err;
      if(!user) {
        return done(null, false, {message: 'Wrong Username/Password'});
      }
      // Match Passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'Wrong Username/Password'});
        }
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
}
