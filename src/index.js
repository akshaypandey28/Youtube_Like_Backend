//require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({ //use for as the file loads then all the environment variables gets loaded for all files
    path: './.env'
})

// Handle other uncaught errors in the application
app.on("error", (error) => {
    console.error("ERROR: ", error);
    process.exit(1); // Terminate the application on uncaught errors
});

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed !!! ",err)
})






/* 
import express from "express"
const app=express()


( async () => {
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) //connecting with database
        app.on("error",(error) => {
            console.log("ERROR: ",error)
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })
    }catch(error){
        console.log("ERROR: ",error)
        throw error
    }
})() */