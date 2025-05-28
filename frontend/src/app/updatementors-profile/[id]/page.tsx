"use client";

import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  Briefcase,
  Building,
  Camera,
  FileText,
  GraduationCap,
  Mail,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function EditTeacherProfilePage() {
  const { id: userId } = useParams();

  const [formData, setFormData] = useState({
    education: "",
    specialization: "",
    experience: "",
    institution: "",
    bio: "",
  });

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
  });

  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [profileImage, setProfileImage] = useState("/profile-icon.png");

  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();

        if (!data.teacherProfile) {
          setNotFoundError(true);
          return;
        }

        const profile = data.teacherProfile;
        const user = profile.user;
        console.log(user);
        setFormData({
          education: profile.education || "",
          specialization: profile.specialization || "",
          experience: profile.experience || "",
          institution: profile.institution || "",
          bio: profile.bio || "",
        });

        setUserInfo({
          fullName: user.name || "",
          email: user.email || "",
        });

        if (profile.coverPhoto) setCoverImage(profile.coverPhoto);
        if (profile.profilePhoto) setProfileImage(profile.profilePhoto);
      } catch (err) {
        console.error("Fetch error:", err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/profile/teacher`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          experience: formData.experience
            ? parseInt(formData.experience, 10)
            : null,
          coverPhoto: coverImage,
          profilePhoto: profileImage,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + result.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred while saving changes.");
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
      `teacher_profiles/${type}-${Date.now()}-${file.name}`
    );
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (type === "cover") setCoverImage(downloadURL);
      else setProfileImage(downloadURL);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
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
            The requested teacher profile could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Teacher Profile
          </h1>
          <p className="text-gray-600">
            Update your professional information and showcase your expertise
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Cover Section */}
          <div className="relative h-64 group overflow-hidden">
            <Image src={coverImage} alt="Cover" fill className="object-cover" />
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
                src={profileImage}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
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
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
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
                    className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
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
                    className="w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Professional Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <GraduationCap size={16} />
                    <span>Education</span>
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    placeholder="e.g., PhD in Computer Science"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <FileText size={16} />
                    <span>Specialization</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g., Machine Learning, Data Science"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <Briefcase size={16} />
                    <span>Experience (years)</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="e.g., 5"
                    min="0"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
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
                    placeholder="e.g., University of Technology"
                    className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  About You
                </h3>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <FileText size={16} />
                  <span>Professional Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Tell us about your teaching philosophy, research interests, and what makes you passionate about education..."
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300 hover:border-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                className="bg-teal-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-teal-700 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
