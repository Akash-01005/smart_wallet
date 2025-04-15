import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const dbConnection = ()=>{
      mongoose.connect(process.env.DB)
      .then(()=>{
        console.log("Database connected successfully....");
      })
      .catch((err)=>{
        console.log("Unable to connnect to database!",err);
      })
}

export default dbConnection;