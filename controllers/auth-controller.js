import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const handleLogin = async (req, res) => {
	try {
		const { email, password } = req.body;

		console.log({ email, password });

		if (!email || !password) {
			return res.json({ message: "incorrect credentials", status: 401 });
		}

		// Find user by email
		const foundUser = await prisma.user.findUnique({
			where: { email }, // Adjust based on your user model
			include: {
				role: true,
			},
		});

		if (!foundUser) {
			return res.json({ message: "incorrect credentials", status: 401 });
		}

		const match = await bcrypt.compare(password, foundUser.password);

		if (match) {
			const { username, role, isActive } = foundUser;

			if (!isActive) {
				return res.json({ message: "Not Authoeized", status: 401 });
			}

			// Create JWTs
			const accessToken = jwt.sign(
				{
					UserInfo: {
						id: foundUser.id,
						email: foundUser.email,
						role: foundUser.role.roleName,
					},
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);

			const refreshToken = jwt.sign(
				{ email: foundUser.email },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "7d" }
			);

			// Save refreshToken in the user's record
			await prisma.user.update({
				where: { email },
				data: { refreshToken: refreshToken },
			});

			// Optionally, set the refresh token in a cookie
			res.cookie("jwt", refreshToken, {
				httpOnly: true,
				secure: true,
				sameSite: "None",
				maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			});

			// Send authorization roles and access token to user
			return res.json({
				accessToken,
				username,
				role: role.roleName,
			});
		} else {
			return res.json({
				message: "incorrect credentials",
				match,
				foundUser,
				status: 401,
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const handleLogout = async (req, res) => {
	// On client, also delete the accessToken

	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(204);
	const refreshToken = cookies.jwt;

	// Is refreshToken in db?
	const foundUser = await User.findOne({
		refreshTokens: { $in: [refreshToken] },
	}).exec();

	if (!foundUser) {
		res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
		return res.sendStatus(204);
	}

	// Delete refreshToken in db
	foundUser.refreshTokens = foundUser?.refreshTokens.filter(
		(token) => token !== refreshToken
	);

	//Update refresh token
	await foundUser.save();

	res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
	res.sendStatus(204);
};

const handleRefreshToken = async (req, res, next) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(401);
	const refreshToken = cookies?.jwt;
	const foundUser = await prisma.user.findFirst({
		where: { refreshToken },
		include: {
			role: true,
			profile: true,
		},
	});

	if (!foundUser) return res.sendStatus(403); //Forbidden

	// evaluate jwt
	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
		if (err || foundUser.email !== decoded.email) return res.sendStatus(403);

		const role = foundUser.role.roleName;
		const accessToken = jwt.sign(
			{
				UserInfo: {
					id: foundUser.id,
					email: decoded.email,
					role: role,
				},
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "15s" }
		);

		// console.log({ accessToken });
		res.json({ token: accessToken });
	});
};

const getUserDetail = async (req, res) => {
	const cookies = req.cookies;
	if (!cookies?.jwt) return res.sendStatus(401);
	const refreshToken = cookies?.jwt;

	const foundUser = await prisma.user.findUnique({
		where: { refreshToken },
		include: {
			role: true,
			profile: true,
		},
	});

	return res.json({ user: foundUser });
};

export { handleLogin, getUserDetail, handleRefreshToken, handleLogout };
