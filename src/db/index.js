//This file sets up the database connection using Mongoose.
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async() =>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connnected !! DB Host: ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("MongoDB connection error",error);
        //exit with failure means exit with code 1 
        process.exit(1)
        
    }
} 


export default connectDB;

//In db/index.js, you have defined the connectDB function to handle the connection to MongoDB.
//In index.js, you import and call connectDB to establish the connection before starting the server.