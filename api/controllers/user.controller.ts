import { Request, Response } from "express";
import pool from "../../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateRandomNumber } from "../../helpers/generate";
import { sendMail } from "../../helpers/sendmail";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

// [POST] /api/user/register
export const register = async (req: Request, res: Response): Promise<Response | void> => {
  const { username, password, email } = req.body;

  try {
    const checkUser = await pool.query("SELECT * FROM users WHERE username = $1 OR email = $2", [username, email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: "Username or Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, password, email)
       VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
      [username, hashedPassword, email]
    );

    const user = result.rows[0];

    // Tạo OTP
    const otpCode = generateRandomNumber(6);
    await pool.query(
      `INSERT INTO user_otps (user_id, otp_code, expires_at) VALUES ($1, $2, NOW() + interval '5 minutes')`,
      [user.id, otpCode]
    );

    // Gửi mail
    await sendMail(
      email,
      "Verify your account",
      `<p>Your OTP code is <b>${otpCode}</b>. It will expire in 5 minutes.</p>`
    );

    return res.status(201).json({
      message: "User registered successfully. Please check your email for OTP.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Registration failed" });
  }
};

// [POST] /api/user/login
export const login = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "User login successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "User login failed!",
      error: error.message,
    });
  }
};

// [POST] /api/user/verifyOtp
export const verifyOtp = async (req: Request, res: Response): Promise<Response | void> => {
  const { email, otp } = req.body;

  try {
    // 1. Tìm user theo email
    const userResult = await pool.query("SELECT id, is_verified FROM users WHERE email = $1", [email]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "User already verified" });
    }

    // 2. Tìm OTP hợp lệ trong bảng user_otps
    const otpResult = await pool.query(
      `SELECT * FROM user_otps 
       WHERE user_id = $1 AND otp_code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // 3. Update user -> is_verified = true
    await pool.query("UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1", [user.id]);

    // 4. Xoá OTP sau khi dùng (optional, tránh reuse)
    await pool.query("DELETE FROM user_otps WHERE user_id = $1", [user.id]);

    return res.json({ message: "Account verified successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};