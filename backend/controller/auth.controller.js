import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { errorHandler } from '../utils/error.js';

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