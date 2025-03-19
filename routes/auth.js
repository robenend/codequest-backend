import express from "express";
import {
	getUserDetail,
	handleLogin,
	handleLogout,
	handleRefreshToken,
} from "../controllers/auth-controller.js";
import { logUserAction } from "../controllers/log-controller.js";
const router = express.Router();

router.post("/admin/sign-in", handleLogin);
router.get("/admin/logout", handleLogout);
router.post("/admin/refresh", handleRefreshToken);
router.get("/admin/user", getUserDetail);

export default router;
