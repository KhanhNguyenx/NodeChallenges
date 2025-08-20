import { Router } from "express";
import * as controller from "../controllers/user.controller";

const router: Router = Router();

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/verifyOtp", controller.verifyOtp);

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "johndoe"
 *         password:
 *           type: string
 *           description: The password of the user
 *           example: "password123"
 *     UserRegisterInput:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "johndoe"
 *         password:
 *           type: string
 *           description: The password of the user
 *           example: "password123"
 *         email:
 *           type: string
 *           description: The email address of the user
 *           example: "user@example.com"
 *     VerifyOtpInput:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           description: The email address of the user
 *           example: "user@example.com"
 *         otp:
 *           type: string
 *           description: The OTP code sent to the user's email
 *           example: "123456"
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: "johndoe"
 *         email:
 *           type: string
 *           description: The email address of the user
 *           example: "user@example.com"
 *     AuthResponse:
 *       type: object
 *       required:
 *         - message
 *         - token
 *         - user
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "User login successfully"
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with the provided username, password, and email, and sends an OTP to the user's email for verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *           example:
 *             username: "johndoe"
 *             password: "password123"
 *             email: "user@example.com"
 *     responses:
 *       201:
 *         description: User registered successfully, OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "User registered successfully. Please check your email for OTP."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "User registered successfully. Please check your email for OTP."
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "user@example.com"
 *       400:
 *         description: Username or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Username or Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Registration failed"
 *
 * /api/user/login:
 *   post:
 *     summary: Login a user
 *     description: Authenticates a user with username and password, returning a JWT token and user information.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           example:
 *             username: "johndoe"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "User login successfully"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "user@example.com"
 *       400:
 *         description: Invalid username or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid username or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "User login failed!"
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 *                   example: "Database error"
 *
 * /api/user/verifyOtp:
 *   post:
 *     summary: Verify OTP for user account
 *     description: Verifies the OTP sent to the user's email to activate their account.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOtpInput'
 *           example:
 *             email: "user@example.com"
 *             otp: "123456"
 *     responses:
 *       200:
 *         description: Account verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Account verified successfully"
 *       400:
 *         description: Invalid or expired OTP, or user already verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid or expired OTP"
 *             examples:
 *               alreadyVerified:
 *                 summary: User already verified
 *                 value:
 *                   error: "User already verified"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "OTP verification failed"
 */



export default router;