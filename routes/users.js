var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Blog = require('../models/blog');
const passport = require('passport');
const blog = require('../models/blog');
const CommentBlog = require('../models/comment');
const Mail = require('../models/mail');
const comment = require('../models/comment');

const usersInfo = ['shpalushi@themclabs.com', 'kcumraku@themclabs.com', 'xhbora@themclabs.com'];
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/register',function(req,res,next){
  database(req,res);
})

async function database(req,res){
  if(usersInfo.includes(req.body.email)){
    return res.status(501).json({"data": "cannot register"});
  }
  else{
    var user= new User({
      name:req.body.name,
      email:req.body.email,
      password: User.hashPassword(req.body.password),
      createdAt: Date.now()
    });
    try{
      doc=await user.save()
      return res.status(201).json(doc);
    }
    catch(err){
      return res.status(501).json(err);
    }
  }
}

router.get('/google/login', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'] }))

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/err' }), (req, res) => {
  req.login(req.session.passport.user,function(err){
    if(err){ return res.status(501).json(err);}
   
        return res.render('google.ejs');
      
   
    //return res.status(200).json({message:'Login Successful'});

  });
})

router.post('/login',function(req,res,next){
  passport.authenticate('local', function(err,user,info){
    if (err){ return res.status(501).json(err);}
    if (!user){ return res.status(501).json(info);}
    req.login(user,function(err){
      if(err){ return res.status(501).json(err);}
      return res.status(200).json({message:'Login Successful'});
    });
  })(req,res,next);
});


router.get('/user',isValidUser,function(req,res,next){
  return res.status(200).json(req.user);
});

router.get('/settings',isValidUser,function(req,res,next){
  return res.status(200).json(req.user);
});

router.put('/settings',isValidUser,function(req,res,next){
   updatedatabase(req,res)

});

async function updatedatabase(req,res){
  
  User.findByIdAndUpdate(req.user._id,req.body).exec().then(result=>{
    return res.status(201).json(result);
  }).catch(err=>{
    return res.status(501).json(err);
  })
}
  

router.get('/logout',isValidUser,function(req,res,next){
  req.logout();
  return res.status(200).json({message:'Logout Successful'});
});






// ##### BLOG ######


router.post('/blogs', function(req,res,next){
  saveBlog(req, res);
})

router.get(`/blog-list`, function(req, res){
  Blog.find({}).sort([['createdAt', -1]]).exec(function(err, blogs) {
    let blogList = blogs.map(x => ({
      _id: x._id,
      title: x.title,
      description:x.description,
      content: x.content,
      user: x.user,
      tags: x.tags,
      createdAt: x.createdAt,
      updatedAt: x.updatedAt

    }))
    res.send(blogList);  
  });
})

router.delete(`/blog`, function(req, res){
  if(req.query._id != null){
  let blogP = Blog.findById(req.query._id, function(error, blog){
    if(blog.userId == req.user._id){
      Blog.findByIdAndRemove(req.query._id).then(result => {
        console.log(result);
          return res.status(200).json({deleted: result})
      });
    }
    return res.status(401).json({deleted: `Not allowed to delete this post you are not admin of this post`})
  });
  }
  else{
    return res.status(404).json({deleted: `Could not find the post`});
  }
})

router.get(`/blog`, function(req, res){
  if(req.query._id != null){
    Blog.findById(req.query._id, function(error, blog){
      return res.status(200).json(blog);
    });
  }
})

async function saveBlog(req,res){
  if(req.query._id != null && req.query._id != "null"){
    console.log(req.query._id);
    let blogP = Blog.findById(req.query._id, function(error, blog){
      if(blog.userId == req.user._id){
        blogBody = {
              title:req.body.title,
              description:req.body.description,
              content:req.body.content,
              image:req.body.image,
              tags:req.body.tags,
              updatedAt: Date.now()
            };
            blogBody.user = req.user.name;
            blogBody.userId = req.user._id;
            Blog.findByIdAndUpdate(req.query._id,blogBody).exec().then(result=>{
                return res.status(201).json(result);
              }).catch(err=>{
                return res.status(501).json(err);
              })
      }
      else{
        return res.status(401).json('Unauthorized request');
      }
      
    });
  }
  else{
    blogBody = {
      title:req.body.title,
      description:req.body.description,
      content:req.body.content,
      image:req.body.image,
      tags:req.body.tags,
      createdAt: Date.now()
    };
    blogBody.user = req.user.name;
    blogBody.userId = req.user._id;
    var blog= new Blog(blogBody);
    try{
      console.log(blog);
      doc=await blog.save()
      return res.status(201).json(doc);
    }
    catch(err){
      console.log(err)
      return res.status(501).json(err);
    }
  }
}




// ##### BLOG ######


// ##### COMMENT ######

router.post('/comment', function(req,res,next){
  console.log(req.user?.email);
  let comment = req.body;
  comment.createdAt = Date.now();
  if(req.user != null){
    comment.name = `Admin team`;
    comment.email = req.user.email;
  }
  try{
    let dataComment = new CommentBlog(comment);
    doc= dataComment.save();
    return res.status(201).json(doc);
  }
  catch(err){
    console.log(err)
    return res.status(501).json(err);
  }
})


router.get(`/comment-blog`, function(req,res,next){
  if(req.query.blogId != null){

    CommentBlog.find({blogId: req.query.blogId}, function(err, comments){
      if(!err)
        return res.status(200).json(comments);
      else{
        return res.status(500).json(err);
      }
    })
  }
})

router.delete(`/comment-blog`, isValidUser, function (req, res, next){

  CommentBlog.findById(req.query._id, function(err, comment){
    if(!err){
      Blog.findById(comment.blogId, function(err2, blog){
        if(blog.userId == req.user._id){
          CommentBlog.findByIdAndRemove(req.query._id).then(result => {
              return res.status(200).json({deleted: result})
          });
        }
        else{
          return res.status(401).json({"data": "unauthorized request"});
        }
      })
    }
  })
  // CommentBlog.findByIdAndRemove(req.query._id).then(result => {
  //   console.log(result);
  //     return res.status(200).json({deleted: result})
  // });
})


// ##### MAIL #######

router.post('/mail', function(req,res,next){
  let mail = {email: req.body.email};
  mail.createdAt = Date.now();
  console.log(mail)
  try{
    let dataMail = new Mail(mail);
    let doc = dataMail.save();
    return res.status(201).json(doc);
  }
  catch(err){
    console.log(err)
    return res.status(501).json(err);
  }
})


function isValidUser(req,res,next){
  if(req.isAuthenticated()){
    next()
  }
  else{
  return res.status(401).json({message:'Unauthorized Request'});
  }
}

module.exports = router;
