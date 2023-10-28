const mongoose = require("mongoose");


const restroSchema = new mongoose.Schema({
    restroName:{
        type:String,
        required:true,
    },
    restroAddress:{
        type:String,
        required:true,
    },
    restroTableCount:{
        type:String,
        required:true,
    },
    restroImage:{
        type:String,
        required:true,
    },  
    restroToken:{
        type:String,
        required:true,
    },
})

module.exports = new mongoose.model("restroInfo", restroSchema);