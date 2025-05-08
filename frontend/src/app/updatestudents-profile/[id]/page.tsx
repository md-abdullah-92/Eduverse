'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { useParams } from 'next/navigation';

export default function EditProfile() {
  const { id: userId } = useParams();
  const [formData, setFormData] = useState({
    educationLevel: '',
    institution: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    dateOfBirth: '',
    address: '',
    bio: ''
  });

  const [coverImage, setCoverImage] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [userInfo, setUserInfo] = useState({ fullName: '', email: '' });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [notFoundError, setNotFoundError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/profile/${userId}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          setNotFoundError(true);
          return;
        }

        const data = await res.json();
        console.log(data);
        setFormData({
          educationLevel: data.educationLevel || data.studentProfile.educationLevel ,
          institution: data.institution || data.studentProfile.institution|| '',
          guardianName: data.guardianName ||data.studentProfile.guardianName || '',
          guardianPhone: data.guardianPhone || data.studentProfile.guardianPhone || '',
          guardianEmail: data.guardianEmail ||data.studentProfile.guardianEmail || '',
          dateOfBirth: data.dateOfBirth?.substring(0, 10) || data.studentProfile.dateOfBirth?.substring(0, 10) || '',
          address: data.address ||data.studentProfile.address || '',
          bio: data.bio || data.studentProfile.bio || ''
        });
        setCoverImage(data.studentProfile.coverPhoto || '');
        setProfileImage(data.studentProfile.profilePhoto || '');
        setUserInfo({ fullName: data.studentProfile.user.name, email: data.studentProfile.user.email });
      } catch (err) {
        console.error('Fetch profile error:', err);
        setNotFoundError(true);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        setMessage('✅ Profile updated successfully!');
      } else {
        setMessage('❌ Failed to update: ' + result.message);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setMessage('❌ An error occurred while saving changes.');
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'profile'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storageRef = ref(storage, `student_profiles/${type}-${Date.now()}-${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      if (type === 'cover') setCoverImage(downloadURL);
      else setProfileImage(downloadURL);
    } catch (error) {
      console.error('Image upload failed:', error);
      setMessage('❌ Failed to upload image.');
    }
  };

  if (loading) return <div className="text-center py-20">Loading profile...</div>;
  if (notFoundError) return <div className="text-center py-20 text-red-500">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-200">
        {/* Cover Image */}
        <div className="relative h-48 bg-gray-200 group">
          <Image
            src={coverImage || '/default-cover.jpg'}
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
        <div className="relative w-40 h-40 -mt-14 ml-2 border-[5px] border-white rounded-full shadow-xl bg-white group">
          <Image
            src={profileImage || '/default-profile.jpg'}
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

        {/* Form */}
        <div className="px-6 pt-12 pb-12 space-y-8">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Edit Student Profile
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
            {[
              'institution',
              'educationLevel',
              'guardianName',
              'guardianPhone',
              'guardianEmail',
              'dateOfBirth',
              'address',
            ].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {field.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type={
                    field === 'dateOfBirth'
                      ? 'date'
                      : field.includes('Email')
                      ? 'email'
                      : field.includes('Phone')
                      ? 'tel'
                      : 'text'
                  }
                  name={field}
                  value={(formData as any)[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-md"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 bg-gray-200 text-gray-800 rounded-md"
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

          {message && <p className="text-center text-sm mt-4">{message}</p>}
        </div>
      </div>
    </div>
  );
}
