import { Request, Response } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const generateToken = (user: IUser): string => {
  const jwtSecret = process.env.JWT_SECRET as Secret;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE ?? "7d") as jwt.SignOptions["expiresIn"],
  };
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    options
  );
};

/*
user: {
           id: user._id,
           name: user.name,
           email: user.email,
           role: user.role,
           isActive: user.isActive,
           createdAt: user.createdAt,
         },
 */

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email, isActive: true }).select(
      "+password"
    );
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
