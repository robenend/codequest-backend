import passport from "passport";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const prisma = new PrismaClient();

// Local Strategy
passport.use(
	new LocalStrategy(
		{ usernameField: "email" },
		async (email, password, done) => {
			try {
				const user = await prisma.user.findUnique({ where: { email } });
				if (!user) return done(null, false, { message: "User not found" });

				const isMatch =
					user.password && (await bcrypt.compare(password, user.password));
				if (!isMatch)
					return done(null, false, { message: "Incorrect password" });

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		}
	)
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:5000/auth/google/callback",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// console.log("Google Profile:", profile); // ✅ Log the full profile response

				const email = profile.emails?.[0]?.value;
				const name = profile.displayName || "Unknown User"; // ✅ Get name
				const picture = profile.photos?.[0]?.value || null; // ✅ Get profile

				if (!email) {
					return done(new Error("No email received from Google"), null);
				}

				let user = await prisma.user.findUnique({ where: { email } });

				if (!user) {
					user = await prisma.user.create({
						data: {
							email,
							provider: "google",
							providerId: profile.providerId,
							profile: {
								create: {
									name,
									profile: picture, // ✅ Store Google name
								},
							},
						},
						include: { profile: true }, // ✅ Ensure profile is created
					});
				}

				return done(null, user);
			} catch (error) {
				return done(error, null);
			}
		}
	)
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export default passport;
