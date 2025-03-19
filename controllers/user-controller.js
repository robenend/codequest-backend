import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const handleLogin = async (req, res) => {
	const { email, password } = req.body;

	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await prisma.user.create({
			data: { email, password: hashedPassword },
		});

		res.json({ user, token: generateToken(user) });
	} catch (error) {
		res.status(400).json({ error: "User already exists" });
	}
};
