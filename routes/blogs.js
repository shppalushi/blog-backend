var express = require('express');
const Blog = require('../models/blog');
var router = express.Router();
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

function isValidUser(req,res,next){
    if(req.isAuthenticated()){
      next()
    }
    else{
    return res.status(401).json({message:'Unauthorized Request'});
    }
  }

  module.exports = router;