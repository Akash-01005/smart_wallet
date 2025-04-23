import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from './src/libs/db.js';
import cookieParser from 'cookie-parser';
import userRouter from "./src/routes/user.routes.js"
import walletRouter from "./src/routes/wallet.routes.js"
import savingsRouter from "./src/routes/savings.routes.js"
dotenv.config();

const app = express();
app.use(cors({
    origin: [process.env.CROS_ORIGIN],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}....`)
});
dbConnection();

app.use('/api/auth', userRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/savings', savingsRouter);






