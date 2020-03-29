const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

//Load User Model
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    // Match user
    User.findOne({email: email})
    .then(user => {
      if (!user) {
        return done(null, false, {message: 'That email is not registered'});
      }
      if(user.verified === false){
        return done(null, false, {message: 'Account not verified, check your mail or resend verification mail'});
      }
      //check verified status from here

      //Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err)
          throw err;

        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {message: 'password Incorrrect'})
        }
      });
    });
  })
);
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    })
  });
};
