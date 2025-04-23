const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Update student profile
exports.updateStudentProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        educationLevel,
        institution,
        guardianName,
        guardianPhone,
        guardianEmail,
        dateOfBirth,
        address,
        coverPhoto,
        profilePhoto,
        bio
    } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { studentProfile: { include: { user: true } } }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'STUDENT') {
            return res.status(403).json({ message: "Only students can update student profile" });
        }

        const profile = await prisma.studentProfile.upsert({
            where: { userId },
            update: {
                educationLevel,
                institution,
                guardianName,
                guardianPhone,
                guardianEmail,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                address,
                coverPhoto,
                profilePhoto,
                bio
            },
            create: {
                userId,
                educationLevel,
                institution,
                guardianName,
                guardianPhone,
                guardianEmail,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                address,
                coverPhoto,
                profilePhoto,
                bio
            }
        });

        res.status(200).json({
            message: "Student profile updated successfully",
            profile
        });
    } catch (error) {
        console.error("Update student profile error:", error);
        res.status(500).json({
            message: "Failed to update student profile",
            error: error.message
        });
    }
};

// Update teacher profile
exports.updateTeacherProfile = async (req, res) => {
    const userId = req.user.id;
    const {
        education,
        specialization,
        experience,
        institution,
        certifications,
        rating,
        coverPhoto,
        profilePhoto,
        bio
    } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: { include: { user: true } } }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'TEACHER') {
            return res.status(403).json({ message: "Only teachers can update teacher profile" });
        }

        if (!user.teacherProfile) {
            return res.status(404).json({ message: "Teacher profile not found" });
        }

        const profile = await prisma.teacherProfile.upsert({
            where: { userId },
            update: {
                education,
                specialization,
                experience,
                institution,
                certifications,
                rating,
                coverPhoto,
                profilePhoto,
                bio
            },
            create: {
                userId,
                education,
                specialization,
                experience,
                institution,
                certifications,
                rating,
                coverPhoto,
                profilePhoto,
                bio
            }
        });

        res.status(200).json({
            message: "Teacher profile updated successfully",
            profile
        });
    } catch (error) {
        console.error("Update teacher profile error:", error);
        res.status(500).json({
            message: "Failed to update teacher profile",
            error: error.message
        });
    }
};

// Update user common fields (profile image and phone number)
exports.updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { profileImage, phoneNumber } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                profileImage,
                phoneNumber
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
                phoneNumber: true
            }
        });

        res.status(200).json({
            message: "User profile updated successfully",
            user
        });
    } catch (error) {
        console.error("Update user profile error:", error);
        res.status(500).json({
            message: "Failed to update user profile",
            error: error.message
        });
    }
};

// Get user profile by ID (role-specific)
exports.getProfileById = async (req, res) => {
    const userId = parseInt(req.params.id, 10);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: { include: { user: true } },
                teacherProfile: { include: { user: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'STUDENT') {
            if (!user.studentProfile) {
                return res.status(404).json({ message: "Student profile not found" });
            }
            return res.status(200).json({
                message: "Profile retrieved successfully",
                studentProfile: user.studentProfile
            });
        } else if (user.role === 'TEACHER') {
            if (!user.teacherProfile) {
                return res.status(404).json({ message: "Teacher profile not found" });
            }
            return res.status(200).json({
                message: "Profile retrieved successfully",
                teacherProfile: user.teacherProfile
            });
        } else {
            return res.status(400).json({ message: "Invalid user role" });
        }
    } catch (error) {
        console.error("Get profile by ID error:", error);
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};

// Get user profile with role-specific details
exports.getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: { include: { user: true } },
                teacherProfile: { include: { user: true } }
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role === 'STUDENT') {
            if (!user.studentProfile) {
                return res.status(404).json({ message: "Student profile not found" });
            }
            return res.status(200).json({
                message: "Profile retrieved successfully",
                studentProfile: user.studentProfile
            });
        } else if (user.role === 'TEACHER') {
            if (!user.teacherProfile) {
                return res.status(404).json({ message: "Teacher profile not found" });
            }
            return res.status(200).json({
                message: "Profile retrieved successfully",
                teacherProfile: user.teacherProfile
            });
        } else {
            return res.status(400).json({ message: "Invalid user role" });
        }
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            message: "Failed to get profile",
            error: error.message
        });
    }
};
