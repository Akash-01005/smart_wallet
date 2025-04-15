import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const verify = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({
                success: false,
                message: 'Authentication required! Please login.',
            });
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(verifyToken.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Your session has expired. Please login again.',
                expired: true
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.',
        });
    }
}

export default verify;