const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
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
 *     description: Creates a new user with the provided username, password, and email.
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
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "User registered successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *             example:
 *               message: "User registered successfully"
 *               user:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "user@example.com"
 *       400:
 *         description: Invalid input data or username/email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Username or Email already exists"
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   errors:
 *                     - type: "field"
 *                       msg: "Username is required"
 *                       path: "username"
 *                       location: "body"
 *                     - type: "field"
 *                       msg: "Email must be a valid email address"
 *                       path: "email"
 *                       location: "body"
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
 *         description: Invalid input data or invalid username/password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid username or password"
 *             examples:
 *               validationError:
 *                 summary: Validation error
 *                 value:
 *                   errors:
 *                     - type: "field"
 *                       msg: "Username is required"
 *                       path: "username"
 *                       location: "body"
 *                     - type: "field"
 *                       msg: "Password is required"
 *                       path: "password"
 *                       location: "body"
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
 *                   example: "User login failed!"
 */
router.post("/register", controller.register);

router.post("/login", controller.login);

module.exports = router;
