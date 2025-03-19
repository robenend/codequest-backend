import express from "express";
import jwt from "jsonwebtoken";
import { handleLogin } from "../controllers/user-controller.js";
import resolvers from "../schema/resolver.js";

const router = express.Router();

router.get("/me", resolvers.getUser);
router.post("/create-challenge", resolvers.createChallenge);
router.post("/create-room", resolvers.createRoom);

router.get("/challenges", resolvers.challenges);
router.get("/challenge", resolvers.challege);

router.get("/resources", resolvers.resources);
router.get("/resource", resolvers.resource);

router.get("/rooms", resolvers.rooms);
router.get("/room", resolvers.room);

export default router;
