import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookies from "../utils/generateToken.js";
import crypto from "crypto";
import { sendMail } from "../utils/sendEmail.js";

// const createToken = (_id) => {
//   const jwtSecretKey = process.env.JWT_SECRET;

//   return jwt.sign({ _id }, jwtSecretKey, { expiresIn: "1d" });
// };

export const loginUser = async (req, res) => {
  const errorMessage = req.session.messages ? req.session.messages[0] : null;
  if (errorMessage) {
    res.redirect(
      `https://slurpping.onrender.com?error=${encodeURIComponent(errorMessage)}`
    );
  }
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPassCorrect = await bcrypt.compare(password, user?.password || "");
    if (!user || !isPassCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    if (!user?.isVerified) {
      return res.status(400).json({ error: "email not verified" });
    }
    const token = generateTokenAndSetCookies(user._id, res);
    res
      .status(200)
      .json({
        user: { _id: user._id, username: user.username },
        accessToken: token,
        isVerified: user?.isVerified,
      });
  } catch (error) {
    console.log("Error login controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    console.log("Error logout controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signupUser = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, isTenant } = req.body;
    if (isTenant) {
      return signupTenant(req, res);
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "password doesn't match" });
    }
    const user = await User.findOne({ username });

    if (user) {
      return res.status(400).json({ error: "Username already exist" });
    }
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ error: "Email already exist" });
    }
    // password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      emailtoken: crypto.randomBytes(64).toString("hex"),
      isVerified: false,
    });
    if (newUser) {
      // generate jwt token
      const token = generateTokenAndSetCookies(newUser._id, res);

      try {
        await sendMail({
          to: email,
          from: process.env.SENDER_EMAIL,
          subject: "Please verify your email by clicking the link below",
          text: "Click the link",
          html: `
                    <h1>Thanks for registering to our site</h1>
                    <p>Please click the link to verify your account</p>
                    <a href="https://slurpping.onrender.com/verify-email?token=${newUser.emailtoken}">Verify your account</a>
                    `,
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      await newUser.save();
      res
        .status(200)
        .json({
          user: { _id: newUser._id, username: newUser.username },
          accessToken: token,
          isVerified: newUser?.isVerified,
        });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error signup controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signupTenant = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username already exist" });
    }
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      return res.status(400).json({ error: "Email already exist" });
    }
    // password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: true,
      isTenant: true,
    });
    if (newUser) {
      // generate jwt token
      const token = generateTokenAndSetCookies(newUser._id, res);
      await newUser.save();
      res
        .status(200)
        .json({
          user: { _id: newUser._id, username: newUser.username },
          accessToken: token,
          isVerified: newUser?.isVerified,
        });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error signup controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  console.log("verify email function enter");
  try {
    const emailtoken = req.query.token;
    console.log("email token: ", emailtoken);
    if (!emailtoken)
      return res.status(404).json("Verification token not found");

    const user = await User.findOne({ emailtoken });

    if (user.isVerified)
      return res.status(400).json({ error: "email already verified" });

    if (user) {
      user.emailtoken = null;
      user.isVerified = true;
      await user.save();
      const token = generateTokenAndSetCookies(user._id, res);
      console.log("email verified successfully");
      res.status(200).json({
        message: "email verification successful",
        user: { _id: user._id, username: user.username },
        accessToken: token,
        isVerified: user?.isVerified,
      });
    } else res.status(400).json({ error: "Email verification failed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const findUser = async (req, res) => {
  try {
    const username = req.query.username;
    if (!username)
      return res.status(404).json({ error: "no username provided" });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    // if(user.username === username) return res.status(500).json({error: "cannot send message to self"});
    return res.status(200).json({ message: "user found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
