"use client";

import { API_URLS } from "@/lib/api/urls";
import Sidebar from "@/components/Common-Components/Sidebar";
import LoadingIndicator from "@/components/ui_elements/loadingIndicator";
import { storage } from "@/firebaseConfig";
import { karma, poppins, raleway, reemKufi, robotoSlab } from "@/utils/font";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ToastContext } from "@/components/ui_elements/toast";
import { useContext } from "react";
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
  const { showToast } = useContext(ToastContext); 

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

  const [coverImage, setCoverImage] = useState("/logo.png");
  const [profileImage, setProfileImage] = useState("/profile-icon.png");

  const [loading, setLoading] = useState(true);
  const [notFoundError, setNotFoundError] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URLS.user}/profile/${userId}`, {
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
      const res = await fetch(`${API_URLS.user}/profile/teacher`, {
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
        showToast("Profile updated successfully!");
      } else {
        showToast("Failed to update profile: " + result.message);
      }
    } catch (err) {
      console.error("Submit error:", err);
      showToast("An error occurred while saving changes.");
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
      showToast("Failed to upload image.");
    }
  };

  if (loading) {
    return <LoadingIndicator text="Loading profile..." />;
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
   const id = userId as string;

  return (
    <div className="flex min-h-screen min-w-0 bg-gradient-to-br from-slate-50 via-teal-50 to-teal-100">
      <Sidebar role="TEACHER" userId={id} />

      <main className="min-w-0 flex-1 p-4 pt-20 sm:p-6 md:pt-6">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:rounded-3xl">
          {/* Cover Section */}
          <div className="group relative h-40 overflow-hidden sm:h-56 lg:h-80">
            <Image src={coverImage} alt="Cover" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-800 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl sm:gap-3 sm:px-6 sm:py-3 sm:text-base"
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
          <div className="relative px-4 sm:px-8">
            <div className="group relative -mt-12 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl sm:-mt-16 sm:h-36 sm:w-36 sm:border-8 lg:-mt-20 lg:h-44 lg:w-44">
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
          <div className="space-y-8 px-4 pb-8 pt-6 sm:px-8 sm:pb-12 sm:pt-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <h3
                  className={`${robotoSlab.className} text-xl font-semibold text-gray-900`}
                >
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <User size={16} /> <span>Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={userInfo.fullName}
                    disabled
                    className={`w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 ${poppins.className}`}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <Mail size={16} /> <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={userInfo.email}
                    disabled
                    className={`w-full px-4 py-3 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 ${poppins.className}`}
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
                <h3
                  className={`${robotoSlab.className} text-xl font-semibold text-gray-900`}
                >
                  Professional Details
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <GraduationCap size={16} /> <span>Education</span>
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 ${karma.className}`}
                    placeholder="e.g., PhD in Computer Science"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <FileText size={16} /> <span>Specialization</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 ${karma.className}`}
                    placeholder="e.g., Machine Learning, Data Science"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <Briefcase size={16} /> <span>Experience (years)</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 ${karma.className}`}
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                  >
                    <Building size={16} /> <span>Institution</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 ${karma.className}`}
                    placeholder="e.g., University of Technology"
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
                <h3
                  className={`${robotoSlab.className} text-xl font-semibold text-gray-900`}
                >
                  About You
                </h3>
              </div>

              <div className="space-y-2">
                <label
                  className={`${raleway.className} flex items-center space-x-2 text-sm font-medium text-gray-700`}
                >
                  <FileText size={16} /> <span>Professional Bio</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Tell us about your teaching philosophy, research interests, and what makes you passionate about education..."
                  className={`w-full px-4 py-3 bg-white text-gray-900 rounded-xl border border-gray-200 resize-none ${karma.className}`}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-stretch border-t border-gray-100 pt-6 sm:justify-end sm:pt-8">
              <button
                onClick={handleSubmit}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-teal-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:w-auto sm:px-8 sm:py-4"
              >
                <span className={reemKufi.className}>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
