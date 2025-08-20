/**
 * @swagger
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
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Username or Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Registration failed"
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
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid username or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User login failed!"
 *                 error:
 *                   type: string
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
 *                   example: "Account verified successfully"
 *       400:
 *         description: Invalid or expired OTP, or user already verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "OTP verification failed"
 */