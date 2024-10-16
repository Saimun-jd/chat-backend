import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import jwt from 'jsonwebtoken';
import { findUser, loginUser, logoutUser, signupUser, verifyEmail } from "../controllers/auth.controllers.js";
import User from "../models/user.model.js"
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// passport setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "https://slurpping-api.onrender.com/api/auth/google/callback",
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      let emailfound = await User.findOne({email: profile.emails[0].value})
      
      if (!user && !emailfound) {
        user = new User({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          isVerified: true,
        });
        await user.save();
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
    done(null, user);
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: "https://slurpping.onrender.com" }),
  (req, res) => {
    const token = jwt.sign({ userID: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15d' });
    // console.log(req.user);
    
    // Store user info and token in session
    req.session.googleAuthInfo = {
      user: {
        _id: req.user._id,
        username: req.user.username || req.user.email.split('@')[0],
      },
      accessToken: token,
      isVerified: req.user.isVerified
    };
    console.log("when setting session ",req.session.googleAuthInfo);

    // Save session before redirect
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.redirect('https://slurpping.onrender.com?error=session_save_failed');
      }
      res.redirect(`https://slurpping.onrender.com/google-auth-success`);
    });
  }
);

router.get('/google-auth-info', (req, res) => {
  console.log('Received request for /google-auth-info');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Cookies:', req.cookies);

  if (req.session.googleAuthInfo) {
    console.log('Google auth info found in session:', req.session.googleAuthInfo);
    res.json(req.session.googleAuthInfo);
    delete req.session.googleAuthInfo;
  } else {
    console.log('No Google auth info found in session');
    res.status(401).json({ error: 'No Google auth info found' });
  }
});

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/signup", signupUser);

router.get("/verify-email", verifyEmail);

router.get("/finduser", findUser);

export default router;