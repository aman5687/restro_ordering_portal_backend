const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    restroToken:{
        type:String,
        required:true,
    },
    tableNumber:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
        default:"available",
    },
    bookedBy:{
        type:String,
        required:true,
    },
    createdAt:{
        type: Date,
        default:Date.now,
        required:true,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
        required:true,
    },

    
});

tableSchema.pre('updateOne', function (next) {
    this.update({}, { $set: { updatedAt: new Date() } });
    next();
});

module.exports = new mongoose.model('table', tableSchema);