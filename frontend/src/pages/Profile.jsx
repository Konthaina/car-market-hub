import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdCloudUpload, MdDelete, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import { MdVerified } from 'react-icons/md';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import Header from '../components/Header';

const Profile = () => {
  const { user, setUser } = useAuthStore();
  useNavigate();
  const fileInputRef = useRef(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || '',
    date_of_birth: user?.date_of_birth || '',
    gender: user?.gender || '',
    company_name: user?.company_name || '',
  });

  // Sync editData with user data whenever user changes
  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        country: user.country || '',
        date_of_birth: user.date_of_birth || '',
        gender: user.gender || '',
        company_name: user.company_name || '',
      });
    }
  }, [user]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/profile/upload-image', formData);

      setUser(response.data.user);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to upload image';
      setUploadError(errorMsg);
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) return;

    setUploadLoading(true);
    setUploadError(null);

    try {
      const response = await api.delete('/profile/image');
      setUser(response.data.user);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete image';
      setUploadError(errorMsg);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      // Send all fields, even if empty (backend will accept partial updates)
      const response = await api.put('/profile', editData);
      setUser(response.data.user);
      setEditSuccess(true);
      setIsEditing(false);
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile';
      setEditError(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCancel = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      postal_code: user?.postal_code || '',
      country: user?.country || '',
      date_of_birth: user?.date_of_birth || '',
      gender: user?.gender || '',
      company_name: user?.company_name || '',
    });
    setIsEditing(false);
    setEditError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="My Profile" showBackButton={true} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-5rem)]">
        {user && (
          <div className="w-full">
            {/* Profile Card - Grid Layout */}
            <div className="glass-effect rounded-3xl p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Avatar and Name */}
                <div className="lg:col-span-1 flex flex-col items-center justify-center py-8 lg:py-0 border-b lg:border-b-0 lg:border-r border-gray-200/50 lg:pr-8">
                  {/* Profile Image */}
                  <div className="relative mb-6">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.name}
                        className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-6xl shadow-2xl border-4 border-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Upload Overlay */}
                    <div
                      className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer group"
                      onClick={handleImageClick}
                    >
                      {uploadLoading ? (
                        <AiOutlineLoading3Quarters className="text-white text-2xl animate-spin" />
                      ) : (
                        <MdCloudUpload className="text-white text-2xl group-hover:scale-110 transition-transform" />
                      )}
                    </div>

                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadLoading}
                    />
                  </div>

                  {/* Delete Button */}
                  {user.profile_image_url && (
                    <button
                      onClick={handleDeleteImage}
                      disabled={uploadLoading}
                      className="mb-4 flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MdDelete className="text-lg" />
                      Delete Photo
                    </button>
                  )}

                  {/* Success Message */}
                  {uploadSuccess && (
                    <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      ✓ Success!
                    </div>
                  )}

                  {/* Error Message */}
                  {uploadError && (
                    <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                      {uploadError}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900 text-center">{user.name}</h1>
                    {user.is_verified && (
                      <MdVerified className="text-green-500 text-2xl" title="Verified user" />
                    )}
                  </div>
                  <p className="text-gray-600 font-medium mt-2 text-center break-all">
                    {user.email}
                  </p>

                  {/* Profile Completion */}
                  <div className="mt-6 w-full max-w-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        Profile Complete
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        {user.profile_complete_percent || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          user.profile_complete_percent >= 90
                            ? 'bg-green-500'
                            : user.profile_complete_percent >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${user.profile_complete_percent || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {user.bio && (
                    <div className="mt-6 text-center">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                        Bio
                      </span>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xs">{user.bio}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Profile Details */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  {/* Edit Button */}
                  {!isEditing && (
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition-colors duration-300"
                      >
                        <MdEdit className="text-lg" />
                        Edit Profile
                      </button>
                    </div>
                  )}

                  {editSuccess && (
                    <div className="mb-4 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                      ✓ Profile updated successfully!
                    </div>
                  )}

                  {editError && (
                    <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                      {editError}
                    </div>
                  )}

                  {isEditing ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-4"
                    >
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Name / Username <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          required
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editData.email}
                          onChange={handleEditChange}
                          required
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          First Name{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={editData.first_name}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Last Name{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={editData.last_name}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Phone{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={editData.phone}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Gender{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <select
                          name="gender"
                          value={editData.gender}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Date of Birth{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="date"
                          name="date_of_birth"
                          value={editData.date_of_birth}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Company Name{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="company_name"
                          value={editData.company_name}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Bio <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <textarea
                          name="bio"
                          value={editData.bio}
                          onChange={handleEditChange}
                          rows="3"
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Address{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={editData.address}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          City <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={editData.city}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          State{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={editData.state}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Postal Code{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="postal_code"
                          value={editData.postal_code}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-2">
                          Country{' '}
                          <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={editData.country}
                          onChange={handleEditChange}
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2 mt-4">
                        <button
                          type="submit"
                          disabled={editLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 font-medium rounded-lg transition-smooth disabled:opacity-50 btn-focus"
                        >
                          <MdSave className="text-lg" />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleEditCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-medium rounded-lg transition-smooth btn-focus"
                        >
                          <MdCancel className="text-lg" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-4">
                      {/* Name Section */}
                      <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                          Username
                        </span>
                        <p className="text-gray-900 font-bold text-lg">{user.name}</p>
                      </div>

                      {/* Email Section */}
                      <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                          Email Address
                        </span>
                        <p className="text-gray-900 font-semibold text-lg break-all">
                          {user.email}
                        </p>
                      </div>

                      {/* Verification Status */}
                      <div
                        className={`p-6 bg-gradient-to-br rounded-2xl border transition-colors duration-300 ${user.is_verified ? 'from-green-50/50 to-emerald-50/50 border-green-100 hover:border-green-200' : 'from-gray-50/50 to-blue-50/50 border-gray-100 hover:border-blue-200'}`}
                      >
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                          Verification Status
                        </span>
                        <div className="flex items-center gap-2">
                          {user.is_verified ? (
                            <>
                              <MdVerified className="text-green-500 text-2xl" />
                              <div>
                                <p className="text-green-700 font-bold text-lg">Verified</p>
                                <p className="text-green-600 text-xs">
                                  Since {new Date(user.verified_at).toLocaleDateString()}
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg">
                                ○
                              </div>
                              <p className="text-gray-600 font-semibold text-lg">Not Verified</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* First Name */}
                      {user.first_name && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            First Name
                          </span>
                          <p className="text-gray-900 font-semibold text-lg">{user.first_name}</p>
                        </div>
                      )}

                      {/* Last Name */}
                      {user.last_name && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Last Name
                          </span>
                          <p className="text-gray-900 font-semibold text-lg">{user.last_name}</p>
                        </div>
                      )}

                      {/* Phone Section */}
                      {user.phone && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Phone
                          </span>
                          <p className="text-gray-900 font-semibold text-lg">{user.phone}</p>
                        </div>
                      )}

                      {/* Company Name */}
                      {user.company_name && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Company
                          </span>
                          <p className="text-gray-900 font-semibold text-lg">{user.company_name}</p>
                        </div>
                      )}

                      {/* Gender */}
                      {user.gender && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Gender
                          </span>
                          <p className="text-gray-900 font-semibold text-lg capitalize">
                            {user.gender}
                          </p>
                        </div>
                      )}

                      {/* Date of Birth */}
                      {user.date_of_birth && (
                        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Date of Birth
                          </span>
                          <p className="text-gray-900 font-semibold text-lg">
                            {new Date(user.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* Bio Section */}
                      {user.bio && (
                        <div className="md:col-span-2 p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Bio
                          </span>
                          <p className="text-gray-900 text-base">{user.bio}</p>
                        </div>
                      )}

                      {/* Address Section */}
                      {(user.address ||
                        user.city ||
                        user.state ||
                        user.postal_code ||
                        user.country) && (
                        <div className="md:col-span-2 p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-3">
                            Address
                          </span>
                          <div className="text-gray-900 text-base space-y-1">
                            {user.address && <p>{user.address}</p>}
                            {(user.city || user.state || user.postal_code) && (
                              <p>
                                {[user.city, user.state, user.postal_code]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                            {user.country && <p>{user.country}</p>}
                          </div>
                        </div>
                      )}

                      {/* Roles Section */}
                      {user.roles && user.roles.length > 0 && (
                        <div className="md:col-span-2 p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors duration-300">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest block mb-4">
                            Role & Permissions
                          </span>
                          <div className="flex flex-wrap gap-3">
                            {user.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-300/50 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                {role.label || role.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
