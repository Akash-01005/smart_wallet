import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type:String,
        unique: true,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required: true
    }
})

const userModel = mongoose.model('Authentication',userSchema);

export default userModel;