'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { UploadIcon } from 'lucide-react';

export default function EditTeacherProfilePage() {
  const [formData, setFormData] = useState({
    education: '',
    specialization: '',
    experience: '',
    institution: '',
    bio: '',
  });

  const [userInfo, setUserInfo] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
  });

  const [coverImage, setCoverImage] = useState('/default-cover.jpg');
  const [profileImage, setProfileImage] = useState('/profile-icon.png');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadTeacherProfile() {
      // Fetch and set form data here
      setFormData({
        education: '',
        specialization: '',
        experience: '',
        institution: '',
        bio: '',
      });
    }

    loadTeacherProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log('Saving data:', formData);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'profile'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      type === 'cover' ? setCoverImage(imageUrl) : setProfileImage(imageUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        {/* Cover Section */}
        <div className="relative h-48 bg-gray-200 group">
          <Image
            src={coverImage}
            alt="Cover"
            fill
            className="object-cover rounded-t-3xl"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => coverInputRef.current?.click()}
              className="bg-white text-gray-800 px-4 py-1.5 rounded shadow hover:bg-gray-100 flex items-center gap-2"
            >
              <UploadIcon size={16} /> Change Cover
            </button>
            <input
              type="file"
              accept="image/*"
              ref={coverInputRef}
              onChange={(e) => handleImageUpload(e, 'cover')}
              className="hidden"
            />
          </div>
        </div>

        {/* Profile Image */}
        <div className="relative w-28 h-28 -mt-14 ml-6 border-[5px] border-white rounded-full shadow-xl bg-white group">
          <Image
            src={profileImage}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => profileInputRef.current?.click()}
              className="text-white bg-black/70 p-1.5 rounded-full hover:bg-black"
            >
              <UploadIcon size={18} />
            </button>
            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              onChange={(e) => handleImageUpload(e, 'profile')}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 pt-12 pb-12 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Edit Teacher Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={userInfo.fullName}
                disabled
                className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={userInfo.email}
                disabled
                className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-100 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-100 rounded-md"
            />
          </div>

          <div className="text-right">
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
