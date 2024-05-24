import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookies from "../utils/generateToken.js";

export const loginUser = async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPassCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPassCorrect) {
            return res.status(400).json({error: "Invalid username or password"});
        }
        const token = generateTokenAndSetCookies(user._id, res);
        res.status(200).json({user: {_id: user._id, username: user.username}, accessToken: token});
    } catch(error) {
        console.log("Error login controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const logoutUser = (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "logged out successfully"});
    } catch(error){
        console.log("Error logout controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}

export const signupUser = async (req, res) => {
    try{
        const {username, email, password, confirmPassword} = req.body;
        if(password !== confirmPassword) {
            return res.status(400).json({error: "password doesn't match"});
        }
        const user = await User.findOne({username});
        if(user) {
            return res.status(400).json({error: "Username already exist"});
        }
        // password encryption
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            username, email, password: hashedPassword
        });
        if(newUser) {
            // generate jwt token
            const token = generateTokenAndSetCookies(newUser._id, res);
            await newUser.save();
            res.status(200).json({user: {_id: newUser._id, username: newUser.username}, accessToken: token});
        } else {
            res.status(400).json({error: "Invalid user data"});
        }
    } catch(error) {
        console.log("Error signup controller", error.message);
        res.status(500).json({error: "Internal server error"});
    }
}