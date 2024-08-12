import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens=async(userId)=>{
    try{
        const user=await User.findById(userId) //user have all objects of User database
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        //refresh token has to be stored in database
        user.refreshToken=refreshToken //used to store refreshToken in object of refreshToken which is in User
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    }
    catch{
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}

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
    const existedUser=await User.findOne({
        $or:[ { username } , { email } ]
    })

    if(existedUser){
        throw new ApiError(409,"User with same username or email already exists")
    }

    //this code checks for images and check for avatar
    const avatarLocalPath=req.files?.avatar[0]?.path; //req.files this is provided by multer
    //const coverImageLocalPath=req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){ //avatar is compulsory
        throw new ApiError(400,"Avatar file is required")
    }


    //this code is helpful in uploading them to cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)


    //this code is helpful in checking again for avatar is it successfully uploaded or not on cloudinary
    if(!avatar){ //avatar is compulsory
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
        throw new ApiError(500,"Something went wrong while registering the user")
    }


    //return response
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )


})


const loginUser=asyncHandler(async(req,res)=>{
    //fetch data from the req body
    //username or email
    //find the user 
    //check password
    //access and refresh token generate
    //send it in cookies

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    //either email or username is required
    const user=await User.findOne({
        $or:[{username}, {email}]
    })

    if(!user){
        throw new ApiError(404,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials") //password is incorrect
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken") //.select remove password refreshToken
    
    //for sending cookies we have to design cookies
    const options={
        httpOnly:true,
        secure:true //both can only be modified by server but not by frontend
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true //both can only be modified by server but not by frontend
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {} , "User logged Out"))
})


const refreshAccessToken=asyncHandler(async(req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken   //req.cookies.cookieName

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        //incoming token gets decoded
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        //User models have a method generateRefreshToken which contains _id through which we can find the user
        const user=await User.findById(decodedToken?._id) 
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        //matching of the incoming token from user and and the saved token in user which gets finded by the help of decoded token
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        //if gets matched then generate new access token
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}

