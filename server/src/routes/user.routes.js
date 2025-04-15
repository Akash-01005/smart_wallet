import express from 'express';
import { signUp, logIn, checkUser, logOut } from '../controllers/user.controller.js';
import verify from '../middleware/verify.middleware.js';

const userRouter = express.Router();

userRouter.post('/signup',signUp);
userRouter.post('/login',logIn);
userRouter.get('/checkuser',verify,checkUser);
userRouter.delete('/logout',verify,logOut);

export default userRouter;