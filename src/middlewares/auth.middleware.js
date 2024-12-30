import {ApiError} from "../utils/ApiError.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        // get token from the cookie
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    
        // check if token is not found
        if (!token) {
            throw new ApiError(401, "Unauthorized");
        }
    
        // verify the token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        
        // check if user is not found in the database
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Invalid Access token");
        }
    
        // set the user in the request object
        req.user = user;
    
        // call the next middleware
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access token");
            } 

});
