import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import exp from "constants"

const app=express()
app.use(cors({  //use method use for setting up the middlewares
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))


app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true,limit:"16kb"}))

app.use(express.static("public")) //any one can access it , public is the name of the folder

app.use(cookieParser()) //to perform CRUD operation

//routes import

import userRouter from './routes/user.routes.js'  //aise import tbhi hoga jb export default ho


//routes declaration
app.use("/api/v1/users",userRouter)


//example below
//http://localhost:8000/api/v1/users/register
//http://localhost:8000/api/v1/users/login
export {app}