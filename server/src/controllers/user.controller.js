import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/user.model.js';

export const signUp = async(req,res)=>{
    const { userName, email, password, contactNo } = req.body;
    const check = await userModel.findOne({userName:userName});
    if(check){
        return res.status(400).json({message:'User already exists!'});
    }
    const hashPassword = await bcrypt.hash(password,10);
    const user = new userModel({
        userName,
        email,
        password:hashPassword,
        contactNo
    });
    await user.save();
    res.status(201).json({message:'User created successfully....'});
}

export const logIn = async(req,res)=>{
    const { email, password } = req.body;
    const check = await userModel.findOne({email:email});
    if(!check){
        return res.status(400).json({message:'User not found!'});
    }
    const matchPassword = await bcrypt.compare(password,check.password);
    if(!matchPassword && check.role !== 'owner'){
        return res.status(400).json({message:'Invalid credentials!'});
    }
    const token = jwt.sign({id:check._id},process.env.JWT_SECRET,{expiresIn:'1d'});
    res.cookie('token',token,{httpOnly:true,secure:true,sameSite:'none',maxAge:30*24*60*60*1000});
    res.status(200).json({message:'Login successful....',user:check});
}

export const checkUser = async(req,res)=>{
    res.status(200).json({message:"Authorized User....",user:req.user});
}

export const logOut = async(req,res)=>{
    res.clearCookie('token',{httpOnly:true,secure:true,sameSite:'none'});
    res.status(200).json({message:'Logout successful....',user:null});
}