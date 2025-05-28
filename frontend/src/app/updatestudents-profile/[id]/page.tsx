"use client";

import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Building,
  Calendar,
  Camera,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EditProfile() {
  const { id: userId } = useParams();
  const [formData, setFormData] = useState({
    educationLevel: "",
    institution: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    dateOfBirth: "",
    address: "",
    bio: "",
  });

  const [coverImage, setCoverImage] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userInfo, setUserInfo] = useState({ fullName: "", email: "" });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          setNotFoundError(true);
          return;
        }

        const data = await res.json();

        setFormData({
          educationLevel:
            data.educationLevel || data.studentProfile.educationLevel || "",
          institution:
            data.institution || data.studentProfile.institution || "",
          guardianName:
            data.guardianName || data.studentProfile.guardianName || "",
          guardianPhone:
            data.guardianPhone || data.studentProfile.guardianPhone || "",
          guardianEmail:
            data.guardianEmail || data.studentProfile.guardianEmail || "",
          dateOfBirth: (
            data.dateOfBirth ||
            data.studentProfile.dateOfBirth ||
            ""
          ).substring(0, 10),
          address: data.address || data.studentProfile.address || "",
          bio: data.bio || data.studentProfile.bio || "",
        });
        setCoverImage(data.studentProfile.coverPhoto || "");
        setProfileImage(data.studentProfile.profilePhoto || "");
        setUserInfo({
          fullName: data.studentProfile.user.name,
          email: data.studentProfile.user.email,
        });
      } catch (err) {
        console.error("Fetch profile error:", err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/profile/student`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          coverPhoto: coverImage,
          profilePhoto: profileImage,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setShowModal(true);
      } else {
        setError('❌ Failed to update: ' + result.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('❌ An error occurred while saving changes.');
    }
  };

  const handleSubmit1 = async () => {
    try {
      const token = localStorage.getItem("token");
      setError("");
      setLoading(true);

      const response = await fetch(
        `http://localhost:5000/api/profile/student/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            coverPhoto: coverImage,
            profilePhoto: profileImage,
          }),
        }
      );

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to update profile. Status: ${response.status}`
        );
      }

      // Update local storage with new profile photo if changed
      if (profileImage) {
        localStorage.setItem("userPhoto", profileImage);
      }

      setShowModal(true);
      setSuccessMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Submit error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "cover" | "profile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(
      storage,
      `student_profiles/${type}-${Date.now()}-${file.name}`
    );
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (type === "cover") setCoverImage(downloadURL);
      else setProfileImage(downloadURL);
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("❌ Failed to upload image.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFoundError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600">
            The requested student profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Student Profile
          </h1>
          <p className="text-gray-600">
            Update your academic information and personal details
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Cover Section */}
          <div className="relative h-64 bg-white group overflow-hidden">
            <Image
              src={coverImage || "/default-cover.jpg"}
              alt="Cover"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-teal-600/20"></div>
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="bg-white/90 backdrop-blur-sm text-gray-800 px-6 py-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center gap-3 font-medium"
              >
                <Camera size={20} />
                Change Cover Photo
              </button>
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                onChange={(e) => handleImageUpload(e, "cover")}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Image */}
          <div className="relative px-8">
            <div className="relative w-44 h-44 -mt-20 border-8 border-white rounded-full shadow-xl bg-white group overflow-hidden">
              <Image
                src={profileImage || "/default-profile.jpg"}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-teal-600/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={() => profileInputRef.current?.click()}
                  className="text-white bg-black/70 p-3 rounded-full hover:bg-black/90 transition-colors duration-300"
                >
                  <Camera size={24} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={profileInputRef}
                  onChange={(e) => handleImageUpload(e, "profile")}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="px-8 pt-8 pb-12 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <User size={16} />
                    <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={userInfo.fullName}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Mail size={16} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Academic Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Building size={16} />
                    <span>Institution</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="e.g., ABC High School"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <GraduationCap size={16} />
                    <span>Education Level</span>
                  </label>
                  <input
                    type="text"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    placeholder="e.g., Grade 12, Bachelor's Degree"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Guardian Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Users size={16} />
                    <span>Guardian Name</span>
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="e.g., John Smith"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Phone size={16} />
                    <span>Guardian Phone</span>
                  </label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    placeholder="e.g., +1 234 567 8900"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Mail size={16} />
                    <span>Guardian Email</span>
                  </label>
                  <input
                    type="email"
                    name="guardianEmail"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    placeholder="e.g., guardian@email.com"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Personal Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Calendar size={16} />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <MapPin size={16} />
                    <span>Address</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g., 123 Main Street, City"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  About You
                </h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText size={16} />
                  <span>Personal Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us about yourself, your interests, goals, and what you're passionate about learning..."
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 hover:border-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-red-700">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">!</span>
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">✓</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Profile Updated!
              </h3>
              <p className="text-gray-600 mb-8">
                Your profile has been successfully updated with the latest
                information.
              </p>
              <button
                onClick={() => {
                  setShowModal(false);
                  history.back();
                }}
                className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
