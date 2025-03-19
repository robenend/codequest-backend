import express from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import { handleLogin } from "../controllers/user-controller.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

const generateToken = (user) =>
	jwt.sign({ id: user.id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

router.post("/register", handleLogin);

router.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) return res.status(401).json({ error: info.message });

		const token = generateToken(user);
		res.json({ user, token });
	})(req, res, next);
});

router.get(
	"/google",
	passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
	"/google/callback",
	passport.authenticate("google", { failureRedirect: "/" }),
	async (req, res) => {
		try {
			const { email, name, picture } = req.user; // ✅ Fetch picture

			const token = generateToken(req.user);

			// ✅ Redirect with name & picture
			res.redirect(
				`http://localhost:5173/login-success?token=${token}&name=${encodeURIComponent(
					name
				)}&picture=${encodeURIComponent(picture)}`
			);
		} catch (error) {
			console.error("Google Auth Error:", error);
			res.redirect("http://localhost:5173?error=auth_failed");
		}
	}
);

export default router;
