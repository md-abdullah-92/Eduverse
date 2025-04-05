const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { sendOTP, generateOTP } = require("../services/emailService");

const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '30d'  // Token expires in 30 days
    });
};

exports.register = async (req, res) => {
    const { name, email, password, role = 'STUDENT' } = req.body;  // Default to STUDENT if role not provided

    try {
        // Validate role
        if (role && !['STUDENT', 'TEACHER'].includes(role)) {
            return res.status(400).json({ 
                message: "Invalid role! Role must be either STUDENT or TEACHER"
            });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "Email already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        const newUser = await prisma.user.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                role,  // Use the provided role or default STUDENT
                otp, 
                otpExpiresAt 
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        await sendOTP(email, otp);
        res.status(201).json({ 
            message: "User registered! Check your email for the OTP.",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed!", error: error.message });
    }
};

exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                otp: true,
                otpExpiresAt: true
            }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified!" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP!" });
        }

        if (new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: "OTP has expired!" });
        }

        const verifiedUser = await prisma.user.update({
            where: { email },
            data: { 
                isVerified: true,
                otp: null,
                otpExpiresAt: null
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        res.status(200).json({ 
            message: "Email verified successfully!",
            user: verifiedUser
        });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ 
            message: "Verification failed!", 
            error: error.message 
        });
    }
};

exports.resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required!" });
    }

    try {
        const user = await prisma.user.findUnique({ 
            where: { email },
            select: {
                id: true,
                email: true,
                isVerified: true,
                otpExpiresAt: true
            }
        });
        
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: "Email already verified!" });
        }

        // Check if previous OTP was sent within the last minute
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        if (user.otpExpiresAt && new Date(user.otpExpiresAt) > oneMinuteAgo) {
            return res.status(429).json({ 
                message: "Please wait for 1 minute before requesting a new OTP.",
                retryAfter: Math.ceil((new Date(user.otpExpiresAt) - oneMinuteAgo) / 1000)
            });
        }

        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        await prisma.user.update({
            where: { email },
            data: { otp, otpExpiresAt }
        });

        await sendOTP(email, otp);
        res.status(200).json({ 
            message: "New OTP sent! Check your email.",
            expiresIn: 300 // 5 minutes in seconds
        });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ 
            message: "Failed to resend OTP!", 
            error: error.message 
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists and email is verified
        const user = await prisma.user.findUnique({ 
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                role: true,
                isVerified: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email before logging in!" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        // Generate JWT token
        const token = generateToken(user.id);

        // Return user data and token
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            },
            token
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ 
            message: "Login failed!", 
            error: error.message 
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ 
            message: "Failed to get profile!", 
            error: error.message 
        });
    }
};
