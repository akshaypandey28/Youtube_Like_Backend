import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser=asyncHandler(async (req,res) => {
    //what i have to do to register a user


    //get user details from frontend
    //validation for username password for not empty
    //check if user already exists by username or email
    //check for images and check for avatar and avatar is compulsory
    //upload them to cloudinary
    //again check for avatar is it successfully uploaded or not on cloudinary
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation may be it can be null
    //return response



    //all user details are in request.body

    const {fullName,email,username,password}=req.body
    console.log("email",email);

    // if(fullName===""){
    //     throw new ApiError(400,"Full name is required")
    // }

    //this code is use for checking all the fileds are provided or not from the end of the user
    if ([fullName,email,username,password].some( (field) => 
        field?.trim()===""  )
    ) {
        throw new ApiError(400,"All fields are required")
    }
    

    //this code checks for if user already exists or not by username or email
    const existedUser=User.findOne({
        $or:[ { username } , { email } ]
    })

    if(existedUser){
        throw new ApiError(409,"User with same username or email already exists")
    }

    //this code checks for images and check for avatar
    const avatarLocalPath=req.files?.avatar[0]?.path; //req.files this is provided by multer
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(avatarLocalPath){ //avatar is compulsory
        throw new ApiError(400,"Avatar file is required")
    }


    //this code is helpful in uploading them to cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    //this code is helpful in checking again for avatar is it successfully uploaded or not on cloudinary
    if(avatar){ //avatar is compulsory
        throw new ApiError(400,"Avatar file is required")
    }

    //this code is helpful in creating user object - create entry in db
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    //this code removes password and refresh token field from response
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation may be it can be null
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }


    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )


})

export {registerUser}

// res.status(200).json({
//     message:"akshay"
// })