const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../config/auth');

//User model
const User = require('../models/User');

//Welcome Page
router.get('/welcome', (req, res) => res.render('welcome'));

//Search for connections
router.get('/',(req, res) => {
    const query  = req.query.filter || "firstname";
    const pageNo = parseInt(req.query.pageNo) || 1;
    const size =  parseInt(req.query.size) || 4;
    const search = req.query.search || '';

    if(pageNo < 0 || pageNo === 0) {
      res.json({"error": "invalid page number"})
    }

    console.log(query)


    User.countDocuments({}, (err, totalcount) =>{

      User.find({ [query]: {$regex: search, $options : 'i'}}).skip( pageNo > 0 ? ((pageNo - 1)  * size) : 0).limit(size).then(users => {
        let totalpages = Math.ceil(totalcount / size)
        res.render('search', {
          users: users,
          pages: totalpages,
          totalcount,
          pageNo
        })
      }).catch(err => console.log(err))
    })
})

//dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {res.render('dashboard')});

module.exports = router;
