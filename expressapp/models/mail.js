var mongoose= require('mongoose');

var schema = new mongoose.Schema({
    email: {type:String, required:true},
    createdAt: {type:Date, required:true}
})

module.exports = mongoose.model('Mail',schema)