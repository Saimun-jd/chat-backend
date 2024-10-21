import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import jwt from "jsonwebtoken";
import {
	findUser,
	loginUser,
	logoutUser,
	signupUser,
	verifyEmail,
} from "../controllers/auth.controllers.js";
import User from "../models/user.model.js";
import dotenv from "dotenv";
import generateTokenAndSetCookies from "../utils/generateToken.js";
dotenv.config();

const router = express.Router();

// passport setup
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL:
				"https://slurpping-api.onrender.com/api/auth/google/callback",
			scope: ["profile", "email"],
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let emailfound = await User.findOne({
					email: profile.emails[0].value,
				});
        // let user = await User.findOne({ googleId: profile.id });

				if (emailfound) {
          if(!emailfound.googleId){
            console.log("please sign in with your username instead.");
            return done(null, false, {message: "please sign in with your username instead."});
          } else{
            // existing user
            return done(null, emailfound);
          }

				} 
        // new user
        let user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              isVerified: true,
            });
        await user.save();
        return done(null, user);

			} catch (error) {
				return done(error, null);
			}
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser(async (user, done) => {
	done(null, user);
});

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: `https://slurpping-api.onrender.com/login`,
    failureMessage: true
	}),
	(req, res) => {
		// console.log('Google callback received');
		res.redirect(
			`https://slurpping.onrender.com/google-auth-success?id=${req.user._id}`
		);
	}
);

router.get("/mongo-auth-info", async (req, res) => {
	try {
		// console.log('Received request for /mongo-auth-info');
		const { id } = req.query;
		if (!id) {
			res.status(400).json({ error: "couldn't retrive id from query" });
		}
		// console.log("id is ", id);

		// // Find the session in MongoDB
		const usr = await User.findById(id);
		if (!usr) {
			// console.log("no user found with this id");
			res.status(400).json({ error: "invalid user access via id" });
		}

		const token = generateTokenAndSetCookies(usr._id, res);
		res.status(200).json({
			user: { _id: usr._id, username: usr.username },
			accessToken: token,
			isVerified: usr?.isVerified,
		});
	} catch (error) {
		console.error("Error retrieving auth info from MongoDB:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/signup", signupUser);

router.get("/verify-email", verifyEmail);

router.get("/finduser", findUser);

export default router;
