import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// method to generate access token and refresh token 

const generateAccessTokenAndRefreshToken = async(userId)=>{
    try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // save the refresh token in the database
    user.refreshToken = refreshToken

    // save the user in the database with refresh token here we have to use validateBeforeSave:false because we are not validating the user before saving the user in the database like password validation, email validation etc.
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

    }catch(error){
        throw new ApiError(500,"Token generation failed");

    }
}

// method to register a user

const registerUser = asyncHandler(async(req,res,next) => {
   // get user details from frontend (by postman or any other way)
   // validation of user details like not empty, email is valid, password is strong etc.
   // check if user already exists in the database . we can check by email ,username or any other unique field
   // check for images , check for avatar
   // upload images to cloudinary , avatar is required so we have check it 
   // create user object -> create entry in db
   // remove password and refresh token field from the response 
   // check for user creation
   // return response to the user

   const {fullName,email,username,password}=req.body
   console.log("email: ",email);
    if(!email || !password || !fullName || !username){
        res.status(400);
        throw new ApiError(400,"Please fill all the fields");
    }
    // now to check user is already exist or not in database . User.findOne() is a method to check user is already exist or not this method is provided by mongoose
    // User.findOne({email:email}).then((user)=>{
    //     if(user){
    //         res.status(400);
    //         throw new ApiError(400,"User already exists");
    //     }
    // }) this is way to check by email but we can check by username also so we have to use $or operator
   const existedUSer =   await User.findOne({
        $or:[{ email },{ username }]
    })
    if(existedUSer){
        throw new ApiError(409,"User with email or username already exists");
    }
    // now we check images are uploaded or not 
   const avatarLocalPath = req.files?.avatar[0]?.path;
//    const coverImageLocalPath = req.files?.coverImage[0]?.path;

// if we want to check the cover image is uploaded or not then we have to use the below code
// in the above code of cover image if we not send cover image from frontend then it will give error because we are trying to access the path of cover image which is not present so we have to use the below code
// in the below code we check if cover image is uploaded or not if uploaded then we get the path of cover image
let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}


   // in above code we check if  images are uploaded on server or not if uploaded then we get the path of images

   if(!avatarLocalPath){
       throw new ApiError(400,"Avatar file is required");
   }

    // upload images to cloudinary
  const avatar =  await uploadOnCloudinary(avatarLocalPath)
  const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

  // again check if avatar is uploaded or not because it is required
    if(!avatar){
        throw new ApiError(400,"Avatar file upload failed");
    }

    // create user object
    // to create user object we have to use the User.create() method which is provided by mongoose
  const user =  await User.create({ 
        fullName,
        email,
        username:username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    // remove password and refresh token field from the response by using select method of mongoose 
    // select method is used to select the fields which we want to show in response and - sign is used to remove the fields from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    // check for user creation
    if(!createdUser){
        throw new ApiError(500,"User creation failed");
    }
    // return response to the user
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User created successfully")
    )   

}) 



// method for login user
const loginUser = asyncHandler(async(req,res) => {
    // get details from request body 
    // username or email based on what user is using for login
    // find the user in the database
    // password check
    // access token and refresh token generation
    // send token to the  cookie 
    // return response to the user

    const {username,email,password} = req.body
    // check if username or email is provided or not
    console.log("email: ",email);
    
    if(!username && !email){
        throw new ApiError(400,"Please provide username or email");
    }
    // find the user in the database
    // to find the user in the database we have to use the User.findOne() method which is provided by mongoose
    // here to check the user we have to use $or(mongodb operator) operator because user can login by email or username so we have to check both
    const user = await User.findOne({
        $or:[{email},{username}]
    })

    // check if user is not found in the database
    if(!user){
        throw new ApiError(404,"User not found");
    }

    // password check
    // to check the password we have to use the comparePassword method which is created by us in user.model.js file
    const isPasswordValid = await user.isPassswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials");
    }

    // access token and refresh token generation

  const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    // remove password and refresh token field from the response by using select method of mongoose 
    // select method is used to select the fields which we want to show in response and - sign is used to remove the fields from the response
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // send token to the  cookie 
    // to send token to the cookie we have to use the cookie method of express
    // in cookie method we have to pass the name of  cookie and value of cookie
    // here we have to set the cookie for access token and refresh token
    const options ={
        httpOnly:true,
        secure:true
    }

    // return response to the user
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User logged in successfully")
    )
    
})

// method for logout user

const logoutUser = asyncHandler(async(req,res) => {
    // delete the refresh token from the database
    // clear the cookie
    // return response to the user

    // delete the refresh token from the database
    // to delete the refresh token from the database we have to use the findByIdAndUpdate method of mongoose
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // to delete the refresh token from the database we have to use the $unset operator of mongodb
        $unset:{
            refreshToken:1
        }
    },
    {
        new:true
    }

)

    // clear the cookie
    // to clear the cookie we have to set the cookie with empty value and expiry date in the past
    const options ={
        httpOnly:true,
        secure:true,
    }

    // return response to the user
    return res.status(200)
    .clearCookie("accessToken"," ",options)
    .clearCookie("refreshToken"," ",options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})

// method to refresh the access token

const refreshAccessToken = asyncHandler(async(req,res) => {
    // get the refresh token from the cookie
    // check if refresh token is not found
    // verify the refresh token
    // get the user from the database
    // generate the new access token
    // send the new access token to the cookie
    // return response to the user

    // get the refresh token from the cookie
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // check if refresh token is not found
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized");
    }

    // verify the refresh token
   try {
     const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
 
     // get the user from the database
     const user = await User.findById(decoded?._id)
 
     // check if user is not found in the database
     if(!user){
         throw new ApiError(401,"Invalid refresh token");
     }
 
     // check if refresh token is not same as the refresh token in the database
     if(user.refreshToken !== incomingRefreshToken){
         throw new ApiError(401,"Invalid or expired refresh token");
     }
 
     // generate the new access token
     const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
 
     // send the new access token to the cookie
     const options ={
         httpOnly:true,
         secure:true
     }
 
     // return response to the user
     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", newRefreshToken, options)
     .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access token refreshed successfully"))
   } catch (error) {
       throw new ApiError(401,error?.message || "Invalid refresh token");
    
   }
})

// change password logic 

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword,newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPassswordCorrect(oldPassword)  // check if old password is correct or not

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid old password");
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})


// get current user details

const getCurrentUser = asyncHandler(async(req,res) => {
    return res.status(200)
    .json(new ApiResponse(200,req.user,"User details fetched successfully"))

})

// update Account details

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"Please fill all the fields");
    }   

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
        $set :{
        fullName, // fullName:fullName old syntax
        email  // email:email old syntax this is new syntax of es6
        }
    },{
        new:true
    }).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Account details updated successfully"))
})

// update user avatar

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.avatar?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    const avatar =  await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Avatar file upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Avatar updated successfully"))
})

// update user cover image

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.coverImage?.path;

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover image file is required");
    }

    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Cover image file upload failed");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password")

    return res.status(200).json(new ApiResponse(200,user,"Cover image updated successfully"))
})

// get user channel profile 
const getUserChannelProfile = asyncHandler(async(req,res) => {
    // get the username from the request params
    const {username} = req.params
// check if username is provided or not 
    if(!username?.trim()){
        throw new ApiError(400,"Please provide username");
    }
// get the channel details from the database // to get the channel details we have to use the aggregate method of mongoose
// in aggregate method we have to use the $match operator to match the username 
// and then we have to use the $lookup operator to get the subscribers and subscribedTo details
// then we have to use the $addFields operator to add the subscriberCount,channelSubscribedToCount,isSubscribed fields in the response
// then we have to use the $project operator to project the fields which we want to show in the response like fullName,username,subscriberCount,channelSubscribedToCount,avatar,coverImage,email,createdAt
// then we have to use the $in operator to check if the user is subscribed to the channel or not
// then we have to use the $size operator to get the length of subscribers and subscribedTo array
   const channel =  await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },
        {
            $addFields:{
                subscriberCount:{$size:"$subscribers"},
                channelSubscribedToCount:{$size:"$subscribedTo"},
                isSubscribed:{if :{$in:[req.user?._id,"$subscribers.subscriber"]},then:true,else:false}
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscriberCount:1,
                channelSubscribedToCount:1,
                avatar:1,
                coverImage:1,
                isSubscribed:1,
                email:1,
                createdAt:1
            }
        }
    ])
    
// aggeration method return the array of objects so we have to check if channel is not found in the database then we have to throw the error
    if(!channel || channel.length === 0){
        throw new ApiError(404,"Channel not found");
    }

    return res.status(200).json(new ApiResponse(200,channel[0],"Channel profile fetched successfully"))
   

})

// watch History Methods
const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}