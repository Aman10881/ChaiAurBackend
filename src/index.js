// require('dotenv').config({path:'./env'}) config of dotenv method 1
import dotenv from "dotenv" // second method to config dotenv because make code constiency import 
import connectDB from "./db/index.js";
import {app} from "./app.js";




dotenv.config({path:'./env'}) // 2nd ke liye 


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is running at port ${process.env.PORT}`); 
    })
})
.catch((err)=>{
    console.log("Mongo DB connection failed !!! ", err);  
})



//This file sets up the server and initializes the database connection.






/*
import express from "express";
const app = express()

// DB connection in index file (using IFFE) This is first apporch of DB connection
(async () => {
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       // when connection done sucessfully but error in expresss then this below line is for that 
       app.on("error",(error)=>{
        console.log("ERR",error);
        throw error
       })

       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`);
        
       })

    }catch(error){
        console.log("Error: ",error);
        throw err
        
    }
})()

*/