"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
//Debugging  - check if env var are loaded correctly  
console.log("JWT_SECRET: ", process.env["JWT_SECRET"]);
console.log("REFRESH_TOKEN_SECRET: ", process.env["REFRESH_TOKEN_SECRET"]);
const generateToken = (res, userId, roleId) => {
    const jwtSecret = process.env["JWT_SECRET"];
    const refreshSecret = process.env["REFRESH_TOKEN_SECRET"];
    if (!jwtSecret || !refreshSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    try {
        //Lets generate a short - lived acccess token for 15 minutes
        // sign(payload: string | Buffer | object, secretOrPrivateKey: null, options?: jwt.SignOptions & { algorithm: "none"; }): string
        const accessToken = jsonwebtoken_1.default.sign({ userId, roleId }, jwtSecret, { expiresIn: "45m" });
        //Lets generate a long - lived acccess token for 30days
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, refreshSecret, { expiresIn: "30d" });
        //set Access token as HTTP-Only secure cookie 
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env["NODE_ENV"] !== "development", // Secure in production
            sameSite: "strict",
            maxAge: 45 * 60 * 1000, // 15 minutes
        });
        // Set Refresh Token as HTTP-Only Secure Cookie
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env["NODE_ENV"] !== "development",
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        console.error("Error generating JWT:", error);
        throw new Error("Error generating authentication tokens");
    }
};
exports.generateToken = generateToken;
