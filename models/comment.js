var mongoose= require('mongoose');

var schema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true},
    createdAt: {type:Date, required:true},
    content: {type:String, required:true},
    blogId: {type:String, required:true},
})

module.exports = mongoose.model('CommentBlog',schema)