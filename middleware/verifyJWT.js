import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../utils/custom-errors.js";

const verifyJWT = (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1]; // Extract token
	if (!token) return res.status(401).json({ error: "Unauthorized" });

	try {
		const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		throw new UnauthorizedError("Unauthorized access: Invalid token.");
	}
};

export default verifyJWT;
