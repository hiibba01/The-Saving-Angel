import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res, next) => {
    try{
        const { name, email, password, profileImageUrl, adminJoinCode} = req.body;

    if(
        !name || !email || !password || name === "" || email === "" || password === ""){
            return next(errorHandler(400, "Please provide all required fields!"))
        }

        // Validate email
    if (!email.includes("@")) {
        return next(errorHandler(400, "Please enter a valid email address."))
    } 

    // Validate password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if (!passwordRegex.test(password)) {
        return next(errorHandler(400, "Password must be at least 8 characters long and contain both letters and numbers."))
    }    
    



    // check if user already exists 
    const  isAlreadyExist = await User.findOne({ email: email });

    if(isAlreadyExist){
        return next(errorHandler(400, "User already exists"));
  }

//   checking user role 
let role = "user";

if(adminJoinCode === process.env.ADMIN_JOIN_CODE){
    role = "admin";
}
const hashedPassword = await bcrypt.hashSync(password, 10);

const newUser = new User({
    name,
    email,
    password: hashedPassword,
    profileImageUrl,
    role
});

    await newUser.save();
    res.json({success: true, message: "Signed-up Successfully!"});
    }
catch (error) {
    next(error.message || "Internal Server Error");
  }

}

export const signin = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password || email === "" || password === ""){
            return next(errorHandler(400, "Please provide all required fields!"));
        }

        const validUser = await User.findOne({email: email});
        if(!validUser){
            return next(errorHandler(400, "User not found! Please sign-up first."));
        }

        // comparing password 

        const validPassword = bcrypt.compareSync(password, validUser.password);

        if(!validPassword){
            return next(errorHandler(400, "Invalid password! Please try again."));
        }

        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET)

        const {password: pass, ...rest} = validUser._doc;

        res.status(200).cookie("access_token", token, {httpOnly: true}).json(rest)
        
    } catch (error) {
        next(error.message);
    }
}

export const userProfile = async (req, res, next) => {
    try{
        const  user = await User.findById(req.user.id);

        if(!user){
            return next(errorHandler(404, "User not found!"));
        }
        const {password: pass, ...rest} = user._doc;

        res.status(200).json(rest);

    } catch (error) {
        next(error);
    }
}