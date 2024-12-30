// This file is used for creating the user schema and model
// schema is the structure of the document and model is the collection of the documents
// structure of the document means what are the fields in the document and what are the types of the fields in the document
// collection of the documents means the collection of the documents in the database
// use of schema and model in mongoDB is like the use of class and object in the programming language
// schema is the class and model is the object
// we use the schema to create the model and we use the model to create the document and we use the document to insert the data in the database 
// we create the schema by using the mongoose.Schema({}) method and we create the model by using the mongoose.model method and we create the document by using the model 
// e.g. User is the model and we export the User model and then we create document in the routes file and controller file by using the User model
// like User.create({}) and then we insert the data in the database by using the document like user.save()
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }],
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String, // cloudinary url
        required:true
    },
    coverImage:{
        type:String, // cloudinary url
    },
    password:{
        type:String,
        required:[true,'Password is required']
    },
    refreshToken:{
        type:String,
    },

},{timestamps:true})

// mongo DB hooks 
// we are using mongoDB hooks name pre hoook means just before saving(its just one event we can use many like remove and validate ) 
// it will do functions what you want like encrypt the passwords

// here we are not using arrow function because in arrow function we do not have the this refernce and here we have to use this kui yhi upper wala values ko hi maniuplate karna hai na  

// Logic for password encryption 

userSchema.pre("save",async function (next){
    // this tell only when password is modified then only encrypt it 
    if(!this.isModified("password")) return next();
    // hasing the password by use of bcrypt 
    this.password = await bcrypt.hash(this.password,10)
    next()
})

// mongo db methods like insertone we can make custom mongoDB methods
// here we are making custom method for checking the password

// matching password because now db has store the encrypted password 
userSchema.methods.isPassswordCorrect = async function(password){
    // this.password is the encrypted password and password is the password which user has entered
    // as bcrypt is used to hash password it also used to compare that password it give true and false value  
    return await bcrypt.compare(password,this.password)
}

// what is jwt ->jwt is json web token. it is brearer token.Brearer token is a token that is sent in the header of the request to authenticate the user
// jwt used for authentication and authorization
// here we are using jwt for generating the token 
// we are using jwt.sign method for generating the token
// jwt.sign has three parameters
// 1. payload : it is the data which we want to store in token
// 2. secret key : it is the key which we use to encrypt the token
// 3. expiry : it is the time for which token is valid
// here we are generating the access token and refresh token
// access token is used for authentication and refresh token is used for authorization  
// we are using two different secret key for generating the token
// we are using two different expiry time for generating the token
// we are using two different payload for generating the token
// we are using two different secret key for generating the token


// now we are antoher mongoDB custom methods to generateAcceesToken and generateRefreshToken both are jwt token differnce in there uses access token is used for authentication and refresh token is used for authorization

// Access token is short lived token and refresh token is long lived token

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        { // three thinks paylod ,secret key , expiry token
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIPRY
        }
    )
}
// we store the refresh token in the database so that we can use it for authorization but we do not store the access token in the database because it is used for authentication and it is not stored in the database
// both are same but we are creating two different methods because both are used for different purposes one for authentication and one for authorization. 
// authorization is used for giving the permission to the user to access the resources and authentication is used for verifying the user is valid or not so user we login we gentrate the access token and when we want to access the resources we use the refresh token to access the resources
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        { // three thinks paylod ,secret key , expiry token
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
//notes of Access token and refresh token 
// Access token is short lived token and refresh token is long lived token
// Access token is used for authentication and refresh token is used for authorization
// Access token is not stored in the database and refresh token is stored in the database
// Access token is used to verify the user is valid or not and refresh token is used to give the permission to the user to access the resources
// Access token is generated when user login and refresh token is generated when user login
// when user login we generate the access token and when we want to access the resources we use the refresh token to access the resources
// when access token is expired then we use the refresh token to generate the new access token
// when refresh token is expired then we have to login again to get the new refresh token
// when user logout then we have to delete the refresh token from the database


export const User = mongoose.model("User",userSchema);