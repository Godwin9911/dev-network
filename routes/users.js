const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const crypto = require('crypto');
//const sgMail = require('@sendgrid/mail');

//User model
const User = require('../models/User');

//Connections model
const Connections = require('../models/Connections');

//Login Page
router.get('/login', (req, res) => res.render('login'));

//Register Page
router.get('/register', (req, res) => res.render('register'));

//reset page
router.get('/reset', (req, res) => res.render('reset'));

//reset password page
router.get('/resetpassword/:id', (req, res) => res.render('resetpassword',{
  id:req.params.id
}));

//profile Update
router.post('/profileupdate/:id', (req, res) => {
    const { firstname, lastname, bio, position, location} = req.body;  
    let errors = [];

    //check required fields
    if (!firstname || !lastname ||  !bio || !location || !position ) {
      errors.push({msg: "please fill all fields"})
    }

    if(errors.length > 0){
          req.flash('erorr_msg', `There's an Error in your Form`)
          res.redirect('/dashboard');
    }else{
      //validation passed
      User.findOne({_id : req.params.id}).then(user => {
        if(user){
            User.updateOne({_id: user._id}, {$set :{ bio: bio, position: position, location: location}})
            .then(() => {
                req.flash('success_msg', `${user.firstname} ${user.lastname} Your profile has been updated`)
                res.redirect('/dashboard');
            }).catch(err => console.log(err))
        }else{
            errors.push({msg: "Can't Update, user doesn't exist"})
        }
      }).catch(err => console.log(err))
    }
})

router.post('/socialupdate/:id', (req,res) => {
  const { twitter, github} = req.body;  
    let errors = [];
    //check required fields
    if (!twitter || !github ) {
      errors.push({msg: "you can submit an empty field for your social media!"})
    }
    if(errors.length > 0){
          req.flash('erorr_msg', `There's an Error in your Form`)
          res.redirect('/dashboard');
    }else{
      //validation passed
      User.findOne({_id : req.params.id}).then(user => {
        if(user){
            User.updateOne({_id: user._id}, {$set :{twitter: twitter, github: github}})
            .then(() => {
                req.flash('success_msg', `${user.firstname} ${user.lastname} Your Social Media links has been updated`)
                res.redirect('/dashboard');
            }).catch(err => console.log(err))
        }else{
            errors.push({msg: "Can't Update, user doesn't exist"})
        }
      }).catch(err => console.log(err))
    }

}) 

router.post('/imageupdate/:id', (req,res) => {
  const { image } = req.body;  
    let errors = [];
    //check required fields
    if (!image ) {
      errors.push({msg: "you can't submit an empty field for your image url!"})
    }
    if(errors.length > 0){
          req.flash('erorr_msg', `There's an Error in your Form`)
          res.redirect('/dashboard');
    }else{
      //validation passed
      User.findOne({_id : req.params.id}).then(user => {
        if(user){
            User.updateOne({_id: user._id}, {$set :{image}})
            .then(() => {
                req.flash('success_msg', `${user.firstname} ${user.lastname} Your image url has been updated`)
                res.redirect('/dashboard');
            }).catch(err => console.log(err))
        }else{
            errors.push({msg: "Can't Update, user doesn't exist"})
        }
      }).catch(err => console.log(err))
    }
}) 

//add new connection
router.post('/connections/:id', (req, res) => {

    
    const  id  = req.body.id;
    const otherid = req.params.id;

    console.log(id);
    console.log(otherid)

    if(!otherid || !id){
      console.log("404")
      res.send("Error")
    }else{

     Connections.updateOne({_id: id}, {$addToSet: { connections: [ otherid ]}}).then(user =>{
        console.log(user)
     }).catch( err => console.log(err) )
     
    }
})

//Register handle
router.post('/register', (req, res) => {
  const {firstname, lastname, email, password, password2} = req.body;
  let errors = [];

  //check required fields
  if (!firstname || !lastname ||  !email || !password || !password2) {
    errors.push({msg: "please fill all fields"})
  }

  //Check passwords match
  if (password !== password2) {
    errors.push({msg: 'Password do not match'})
  }

  //check pass length
  if (password.length < 8) {
    errors.push({msg: 'Pasword should be at least 8 characters'})
  }

  //if errors
  if (errors.length > 0) {
    res.render('register', {
      errors,
      firstname,
      lastname,
      email,
      password,
      password2
    })
  } else {
    //validation passed
    User.findOne({email: email}).then(user => {
      if (user) {
        // user exist
        errors.push({msg: 'Email is already registered'});
        res.render('register', {
          errors,
          firstname,
          lastname,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({firstname, lastname, email, password, verified: false});

        //Hash password
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err)
            throw err;

          //set password to hashed
          newUser.password = hash
          //save user
          newUser.save()
          .then(user => {
            //send Mail
            console.log(user);
            req.flash('success_msg', 'You are now registered and can log in')
            res.redirect('/users/login');
          }).catch(err => console.log(err));
        }))
      }
    });
  }
})

//reset handle
router.post('/reset', (req, res) => {
  const email = req.body.email;
  let errors = [];
  //check required field
  if(!email){
    errors.push({msg: "Please Enter your email"})
  }
  //if errors exist
  if(errors.length > 0){
    res.render('reset', {
      errors,
      email
    })
  }else{
    //validation successful
    User.findOne({email: email}, (err, user) =>{
      //user doesn't exist
      if(!user){
        //user does not exist send a different mail
        req.flash('error_msg',`Account not found`)
        res.redirect('/users/reset');
      }else{
        //save id to database
        User.updateOne({_id: user._id},{$set : {reset_id: crypto.randomBytes(16).toString("hex")}})
        .then(stuff => {
          if(err){
            console.log(err);
          }else{
            //send mail
           /* const msg = {
              to: 'agedah99@yahoo.com',
              from: 'passwordreset@devnetwork',
              Subject: 'passwword recovery mail sent with SendGrid',
              text: 'click the link to reset your password',
              html: `<a href="http://127.0.0.1:5000/users/resetpassword/${id}">http://127.0.0.1:5000/users/resetpassword/${id}</a>`,
            }
            sgMail.send(msg);*/

            console.log(`http://127.0.0.1:5000/users/resetpassword/${user.reset_id}`)
            //success message
            req.flash('success_msg','We have sent an email to ' + user.email + ' with further instructions')
            res.redirect('/users/reset');
          }
        });
      }
    })
  }

});

//reset password handle
router.post('/resetpassword/:id', (req, res) => {
  const {password, password2} = req.body;
  const paramId = req.params.id;
  let errors = [];
  //check required fields
  if(!password || !password2){
    errors.push({msg: "please fill all fields"})
  }
  //Check passwords match
  if (password !== password2) {
    errors.push({msg: 'Password do not match'})
  }
  //check pass length
  if (password.length < 8) {
    errors.push({msg: 'Pasword should be at least 8 characters'})
  }

  //if errors exist
  if(errors.length > 0){
    res.render('resetpassword', {
      errors,
      id: req.params.id,
      password,
      password2
    })
  }else{

    User.findOne({reset_id: paramId}).then((user)=>{
      //id doesn't exist
      if(!user){
        req.flash('error_msg','link expired, Enter your email to request new link')
        res.redirect('/users/reset');
      }else{
        //hash password and save
        bcrypt.genSalt(10, (err, salt) => bcrypt.hash(password, salt, (err, hash) => {
          if (err)
            throw err;
            //set password to hash
            let password = hash
            //update current password
            User.updateOne({_id: user._id},{$set :{password: password}}, function(err){
              if(err){
                console.log(err)
              }else{
                //Delete ID so it can't be used
                User.deleteOne({reset_id: user.reset_id},  function(err){//this is deleting all my record
                  if(err){
                    console.log(err);
                  }else{
                    //success message
                    req.flash('success_msg','Password have been reset for ' + user.email + ' Log in with your new password')
                    res.redirect('/users/login');
                  }
                });
              }
            });

        }));
      }
    });

  }

});


//Login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
})

module.exports = router;
