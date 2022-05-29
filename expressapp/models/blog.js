var mongoose= require('mongoose');

var schema = new mongoose.Schema({
    title: {type:String, required:true},
    description: {type:String, required:true},
    content: {type:String, required:true},
    user: {type:String, required:true},
    userId: {type:String, required:true},
    createdAt: {type:Date, required:true},
    image: {type:String, required:false},
    tags: {type:String, required:true},
    updatedAt: {type: Date, required: false}
})

module.exports = mongoose.model('Blog',schema)