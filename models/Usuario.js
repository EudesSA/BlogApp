const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Usuario = new Schema({
    nome:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    eAdmin:{
        type:Number,
        default:0
        //se default for = 0 não é administrador se for = 1 é ADM
    },
    senha:{
        type:String,
        required:true
    }
});


mongoose.model('usuarios',Usuario);