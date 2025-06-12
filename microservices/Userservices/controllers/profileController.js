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
            include: { teacherProfile: true }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== 'TEACHER') {
            return res.status(403).json({ message: "Only teachers can update teacher profile" });
        }

        if (!user.teacherProfile) {
            // If profile doesn't exist, create one
            const newProfile = await prisma.teacherProfile.create({
                data: {
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

            return res.status(201).json({
                message: "Teacher profile created successfully",
                profile: newProfile
            });
        }

        // Profile exists, update it
        const updatedProfile = await prisma.teacherProfile.update({
            where: { userId },
            data: {
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
            profile: updatedProfile
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
        studentProfile: {
          include: { user: true ,
            quizResults: {
              include: { answeredquestions: true },
            },

          },
        },
        teacherProfile: {
          include: {
            user: true,
            quizzes: {
              include: {
                questions: true,
              },
            },
            assignments: true,
            studyNotes: true,
          },
        },
      },
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
        studentProfile: user.studentProfile,
      });
    } else if (user.role === 'TEACHER') {
      if (!user.teacherProfile) {
        return res.status(404).json({ message: "Teacher profile not found" });
      }
      return res.status(200).json({
        message: "Profile retrieved successfully",
        teacherProfile: user.teacherProfile,
      });
    } else {
      return res.status(400).json({ message: "Invalid user role" });
    }
  } catch (error) {
    console.error("Get profile by ID error:", error);
    res.status(500).json({
      message: "Failed to get profile",
      error: error.message,
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
                studentProfile: { include: { user: true ,
                    quizResults: { include: { quiz: true } },
                } },
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
// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: 'TEACHER' },
            include: { teacherProfile: true }
        });

        if (!teachers || teachers.length === 0) {
            return res.status(404).json({ message: "No teachers found" });
        }

        res.status(200).json({
            message: "Teachers retrieved successfully",
            teachers
        });
    } catch (error) {
        console.error("Get all teachers error:", error);
        res.status(500).json({
            message: "Failed to get teachers",
            error: error.message
        });
    }
};
// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' },
            include: { studentProfile: true }
        });

        if (!students || students.length === 0) {
            return res.status(404).json({ message: "No students found" });
        }

        res.status(200).json({
            message: "Students retrieved successfully",
            students
        });
    } catch (error) {
        console.error("Get all students error:", error);
        res.status(500).json({
            message: "Failed to get students",
            error: error.message
        });
    }
};
