const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true,
    },
    stock:{
        type:String,
        required:true,

    },
    token:{
        type:String,
        required:true,
    },
    quantity:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
});

module.exports = mongoose.model('Stock', stockSchema);