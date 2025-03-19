import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import corsOptions from "./config/corsOptions.js";
import passport from "./config/passport.js";
import credentials from "./middleware/credentials.js";
import requestLogger from "./middleware/requestLogger.js";
import apiRouter from "./routes/other.js";
import router from "./routes/route.js";
import verifyJWT from "./middleware/verifyJWT.js";

const app = express();
dotenv.config();
app.use(requestLogger);
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

const port = process.env.port || 5000;
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// built-in middleware for json
app.use(express.json({ limit: "50mb" }));

// app.use(verifyJWT);

// Handle options credentials check - before CORS!
app.use(credentials);
//middleware for cookies
app.use(cookieParser());

// and fetch cookies credentials requirement
// Cross Origin Resource Sharing
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded form data
app.use(express.static("public"));
app.use("/auth", router);
app.use("/api", verifyJWT, apiRouter);

// Route to read the Excel file from the local folder

app.listen(port, () => {
	console.log(`🚀 running at ${port}`);
});
