const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

//init app
const app = express();

//passport Config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;

//connect to Mongo
mongoose.connect(db, {useNewUrlParser: true}).then(() => console.log('MongoDB Connected..')).catch(err => console.log(err));

//use bootstrap folder
app.use(express.static(path.join(__dirname + '/node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname + '/node_modules/jquery/dist')));
app.use(express.static(path.join(__dirname + '/node_modules/popper.js/dist')));
app.use(express.static(path.join(__dirname + '/node_modules/bootswatch/dist')));

//public
app.use(express.static(path.join(__dirname + '/public')));

//fontawesome
app.use(express.static(path.join(__dirname + '/node_modules/font-awesome')));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Bodyparser
app.use(express.urlencoded({extended: false}));

//Express Session
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//passport Middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
})

//connect flash
app.use(flash());

//Global vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

//404
app.use(( req, res) =>{
  res.status(400);
  res.send({Message: 'Route not found'});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started on port ${PORT}`));
