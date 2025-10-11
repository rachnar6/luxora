import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback', // This must match the URI in Google Cloud Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called after Google successfully authenticates the user.
      const newUser = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };

      try {
        // Check if a user with this Google ID already exists in our database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If the user is found, we pass them to the next step
          done(null, user);
        } else {
          // If not, we check if a user with that email already exists
          user = await User.findOne({ email: newUser.email });

          if (user) {
            // If a user with that email exists (e.g., they signed up with a password),
            // we link their Google ID to their existing account
            user.googleId = profile.id;
            await user.save();
            done(null, user);
          } else {
            // If no user exists with this Google ID or email, create a new user
            user = await User.create(newUser);
            done(null, user);
          }
        }
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

// These functions are required by Passport to manage session data
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});