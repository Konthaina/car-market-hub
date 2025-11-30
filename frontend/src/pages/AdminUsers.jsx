import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  FaUsers,
  FaSearch,
  FaTrash,
  FaUndo,
  FaSkull,
  FaEdit,
  FaUser,
  FaEnvelope,
  FaClock,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import Header from '../components/Header';

const AdminUsers = () => {
  useNavigate();
  useAuthStore();
  const [users, setUsers] = useState([]);
  const [trashedUsers, setTrashedUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'trashed'
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const searchTimeoutRef = useRef(null);

  // Modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [editFormData, setEditFormData] = useState({ name: '', email: '' });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      await fetchUsers('');
      await fetchMetadata();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchMetadata = async () => {
    try {
      setAvailableRoles(['admin', 'seller', 'buyer']);
    } catch (err) {
      console.error('Error fetching metadata:', err);
    }
  };

  const fetchUsers = async (query) => {
    try {
      setLoadingUsers(true);
      if (activeTab === 'trashed') {
        const response = await api.get('/admin/users-trashed', {
          params: { per_page: 50, q: query || undefined },
        });
        setTrashedUsers(response.data.data || []);
      } else {
        const response = await api.get('/admin/users', {
          params: { per_page: 50, q: query || undefined },
        });
        setUsers(response.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchUsers(query);
    }, 500);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleRestoreUser = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/restore`);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error restoring user:', err);
      alert('Failed to restore user');
    }
  };

  const handleForceDelete = async (userId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      await api.delete(`/admin/users/${userId}/force`);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error force deleting user:', err);
      alert('Failed to force delete user');
    }
  };

  const openRoleModal = (usr) => {
    setSelectedUser(usr);
    setUserRoles(usr.roles?.map((r) => r.name) || []);
    setShowRoleModal(true);
  };

  const openEditModal = (usr) => {
    setSelectedUser(usr);
    setEditFormData({
      name: usr.name,
      email: usr.email,
    });
    setEditImagePreview(null);
    setEditImageFile(null);
    setShowEditModal(true);
  };

  const openProfileModal = (usr) => {
    setSelectedUser(usr);
    setShowProfileModal(true);
  };

  const openVerifyModal = (usr) => {
    setSelectedUser(usr);
    setShowVerifyModal(true);
  };

  const handleUpdateVerification = async (isVerified) => {
    if (!selectedUser) return;

    setLoadingVerify(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}/verify`, {
        is_verified: isVerified,
      });
      setShowVerifyModal(false);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error updating verification:', err);
      alert(err.response?.data?.message || 'Failed to update verification status');
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    setLoadingRoles(true);
    try {
      await api.patch(`/admin/users/${selectedUser.id}/roles`, {
        roles: userRoles,
      });
      setShowRoleModal(false);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error saving roles:', err);
      alert(err.response?.data?.message || 'Failed to save roles');
    } finally {
      setLoadingRoles(false);
    }
  };

  const toggleRole = (role) => {
    setUserRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    setLoadingEdit(true);
    try {
      // Save user data
      await api.put(`/admin/users/${selectedUser.id}`, {
        name: editFormData.name,
        email: editFormData.email,
      });

      // Upload profile image if selected
      if (editImageFile) {
        const formData = new FormData();
        formData.append('image', editImageFile);
        await api.post(`/admin/users/${selectedUser.id}/upload-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setShowEditModal(false);
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditImagePreview(event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === currentUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(currentUsers.map((u) => u.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    const count = selectedUsers.size;
    if (!window.confirm(`Delete ${count} user${count > 1 ? 's' : ''}?`)) return;

    setLoadingUsers(true);
    try {
      const deletePromises = Array.from(selectedUsers).map((userId) =>
        api.delete(`/admin/users/${userId}`)
      );
      await Promise.all(deletePromises);
      setSelectedUsers(new Set());
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error bulk deleting users:', err);
      alert(err.response?.data?.message || 'Failed to delete some users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedUsers.size === 0) return;

    const count = selectedUsers.size;
    if (!window.confirm(`Restore ${count} user${count > 1 ? 's' : ''}?`)) return;

    setLoadingUsers(true);
    try {
      const restorePromises = Array.from(selectedUsers).map((userId) =>
        api.patch(`/admin/users/${userId}/restore`)
      );
      await Promise.all(restorePromises);
      setSelectedUsers(new Set());
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error bulk restoring users:', err);
      alert(err.response?.data?.message || 'Failed to restore some users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBulkForceDelete = async () => {
    if (selectedUsers.size === 0) return;

    const count = selectedUsers.size;
    if (
      !window.confirm(
        `Permanently delete ${count} user${count > 1 ? 's' : ''}? This cannot be undone.`
      )
    )
      return;

    setLoadingUsers(true);
    try {
      const forceDeletePromises = Array.from(selectedUsers).map((userId) =>
        api.delete(`/admin/users/${userId}/force`)
      );
      await Promise.all(forceDeletePromises);
      setSelectedUsers(new Set());
      fetchUsers(searchQuery);
    } catch (err) {
      console.error('Error force deleting users:', err);
      alert(err.response?.data?.message || 'Failed to force delete some users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const currentUsers = activeTab === 'trashed' ? trashedUsers : users;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="User Management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setActiveTab('active');
                  setSearchQuery('');
                  setSelectedUsers(new Set());
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Active Users
              </button>
              <button
                onClick={() => {
                  setActiveTab('trashed');
                  setSearchQuery('');
                  setSelectedUsers(new Set());
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'trashed'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Deleted ({trashedUsers.length})
              </button>
            </div>
            {selectedUsers.size > 0 && (
              <div className="flex space-x-2">
                {activeTab === 'active' ? (
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                  >
                    <FaTrash className="h-4 w-4" />
                    <span>Delete ({selectedUsers.size})</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBulkRestore}
                      className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                    >
                      <FaUndo className="h-4 w-4" />
                      <span>Restore ({selectedUsers.size})</span>
                    </button>
                    <button
                      onClick={handleBulkForceDelete}
                      className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl font-semibold transition-all flex items-center space-x-2"
                    >
                      <FaSkull className="h-4 w-4" />
                      <span>Force Delete ({selectedUsers.size})</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or email..."
              className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all"
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Role Modal */}
        {showRoleModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedUser.profile_image_url ? (
                      <img
                        src={selectedUser.profile_image_url}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Manage Roles</h2>
                    <p className="text-sm text-gray-600">{selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="space-y-3 mb-6">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userRoles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700 font-medium capitalize">{role}</span>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRoles}
                    disabled={loadingRoles}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {loadingRoles ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Profile Modal */}
        {showProfileModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">User Profile Details</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Profile Image */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-4 flex-shrink-0">
                    {selectedUser.profile_image_url ? (
                      <img
                        src={selectedUser.profile_image_url}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="h-16 w-16 text-blue-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>

                {/* Profile Completion */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase">
                      Profile Completion
                    </h3>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedUser.profile_complete_percent || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        (selectedUser.profile_complete_percent || 0) >= 80
                          ? 'bg-green-500'
                          : (selectedUser.profile_complete_percent || 0) >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedUser.profile_complete_percent || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    {(selectedUser.profile_complete_percent || 0) >= 80
                      ? 'Profile is well-completed'
                      : (selectedUser.profile_complete_percent || 0) >= 50
                        ? 'Profile needs more information'
                        : 'Profile is incomplete'}
                  </p>
                </div>

                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{selectedUser.first_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{selectedUser.last_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Gender
                      </label>
                      <p className="text-gray-900 capitalize">{selectedUser.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Date of Birth
                      </label>
                      <p className="text-gray-900">
                        {selectedUser.date_of_birth
                          ? new Date(selectedUser.date_of_birth).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Street Address
                      </label>
                      <p className="text-gray-900">{selectedUser.address || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                      <p className="text-gray-900">{selectedUser.city || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        State/Province
                      </label>
                      <p className="text-gray-900">{selectedUser.state || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Postal Code
                      </label>
                      <p className="text-gray-900">{selectedUser.postal_code || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Country
                      </label>
                      <p className="text-gray-900">{selectedUser.country || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Professional
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Company Name
                    </label>
                    <p className="text-gray-900">{selectedUser.company_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Bio</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedUser.bio}</p>
                  </div>
                )}

                {/* Account Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Account Status
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Verified
                      </label>
                      <div className="flex items-center space-x-2">
                        {selectedUser.is_verified ? (
                          <>
                            <FaCheck className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-semibold">Yes</span>
                          </>
                        ) : (
                          <>
                            <FaTimes className="h-4 w-4 text-red-600" />
                            <span className="text-red-600 font-semibold">No</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Verified At
                      </label>
                      <p className="text-gray-900">
                        {selectedUser.verified_at
                          ? new Date(selectedUser.verified_at).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedUser.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">
                        {new Date(selectedUser.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Roles */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.roles?.length > 0 ? (
                      selectedUser.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                        >
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm italic">No roles assigned</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verify User Modal */}
        {showVerifyModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ${
                      selectedUser.is_verified ? 'bg-green-100' : 'bg-yellow-100'
                    }`}
                  >
                    {selectedUser.profile_image_url ? (
                      <img
                        src={selectedUser.profile_image_url}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser
                        className={`h-6 w-6 ${selectedUser.is_verified ? 'text-green-600' : 'text-yellow-600'}`}
                      />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {selectedUser.is_verified ? 'Unverify User' : 'Verify User'}
                    </h2>
                    <p className="text-sm text-gray-600">{selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Current Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Current Status</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedUser.is_verified ? 'Verified' : 'Unverified'}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
                      selectedUser.is_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {selectedUser.is_verified ? (
                      <>
                        <FaCheck className="h-4 w-4" />
                        <span>Yes</span>
                      </>
                    ) : (
                      <>
                        <FaTimes className="h-4 w-4" />
                        <span>No</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Incomplete Warning */}
                {!selectedUser.is_verified && (selectedUser.profile_complete_percent || 0) < 90 && (
                  <div className="p-4 rounded-lg border-2 bg-red-50 border-red-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5 text-red-600">
                        <FaTimes className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-red-900">Profile Incomplete</p>
                        <p className="text-sm mt-1 text-red-700">
                          User&apos;s profile must be at least 90% complete before verification.
                          Current completion: {selectedUser.profile_complete_percent || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirmation Message */}
                {(selectedUser.is_verified ||
                  (selectedUser.profile_complete_percent || 0) >= 90) && (
                  <div
                    className={`p-4 rounded-lg border-2 ${
                      selectedUser.is_verified
                        ? 'bg-red-50 border-red-200'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`flex-shrink-0 mt-0.5 ${
                          selectedUser.is_verified ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {selectedUser.is_verified ? (
                          <FaTimes className="h-5 w-5" />
                        ) : (
                          <FaCheck className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold ${
                            selectedUser.is_verified ? 'text-red-900' : 'text-green-900'
                          }`}
                        >
                          {selectedUser.is_verified
                            ? 'Unverify Confirmation'
                            : 'Verify Confirmation'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${
                            selectedUser.is_verified ? 'text-red-700' : 'text-green-700'
                          }`}
                        >
                          {selectedUser.is_verified
                            ? `${selectedUser.name} will no longer be marked as a verified user. They will need to resubmit verification documents.`
                            : `${selectedUser.name} will be marked as a verified user and will have full access to verified features.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Details */}
                {selectedUser.verified_at && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                      Verification Details
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Verified on:</span>{' '}
                        {new Date(selectedUser.verified_at).toLocaleDateString()} at{' '}
                        {new Date(selectedUser.verified_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="border-t border-gray-200 pt-4 flex space-x-3">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateVerification(!selectedUser.is_verified)}
                    disabled={
                      loadingVerify ||
                      (!selectedUser.is_verified &&
                        (selectedUser.profile_complete_percent || 0) < 90)
                    }
                    className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 font-semibold rounded-lg transition-all disabled:opacity-50 ${
                      selectedUser.is_verified
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                        : !selectedUser.is_verified &&
                            (selectedUser.profile_complete_percent || 0) < 90
                          ? 'bg-gray-400 text-white shadow-md cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
                    }`}
                  >
                    {loadingVerify ? (
                      <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                    ) : selectedUser.is_verified ? (
                      <FaTimes className="h-4 w-4" />
                    ) : (
                      <FaCheck className="h-4 w-4" />
                    )}
                    <span>{selectedUser.is_verified ? 'Unverify User' : 'Verify User'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {selectedUser.profile_image_url ? (
                      <img
                        src={selectedUser.profile_image_url}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Edit User</h2>
                    <p className="text-sm text-gray-600">{selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-4">
                <form className="space-y-4">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden mb-4 flex-shrink-0">
                      {editImagePreview ? (
                        <img
                          src={editImagePreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : selectedUser.profile_image_url ? (
                        <img
                          src={selectedUser.profile_image_url}
                          alt={selectedUser.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser className="h-10 w-10 text-blue-600" />
                      )}
                    </div>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg cursor-pointer transition-colors font-medium text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <span>Change Image</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>

                <div className="border-t border-gray-200 pt-4 flex space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={loadingEdit}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                  >
                    {loadingEdit ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        {loadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <AiOutlineLoading3Quarters className="animate-spin h-12 w-12 text-blue-600" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => fetchUsers(searchQuery)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : currentUsers.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <th className="px-4 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.size > 0 && selectedUsers.size === currentUsers.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Roles
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((usr) => (
                    <tr
                      key={usr.id}
                      className={`transition-colors ${selectedUsers.has(usr.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-4 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(usr.id)}
                          onChange={() => toggleUserSelection(usr.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {usr.profile_image_url ? (
                              <img
                                src={usr.profile_image_url}
                                alt={usr.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FaUser className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <span className="font-medium">{usr.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaEnvelope className="h-4 w-4 text-gray-400" />
                          <span>{usr.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {usr.roles?.length > 0 ? (
                            usr.roles.map((role) => (
                              <span
                                key={role.id}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"
                              >
                                {role.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-xs italic">No roles</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaClock className="h-4 w-4 text-gray-400" />
                          <span>{new Date(usr.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex justify-end items-center space-x-2 flex-wrap gap-1">
                          {activeTab === 'active' ? (
                            <>
                              <button
                                onClick={() => openProfileModal(usr)}
                                className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1"
                                title="View Profile"
                              >
                                <FaUser className="h-3 w-3" />
                                <span>Profile</span>
                              </button>
                              <button
                                onClick={() => openVerifyModal(usr)}
                                disabled={
                                  !usr.is_verified && (usr.profile_complete_percent || 0) < 90
                                }
                                className={`px-3 py-1.5 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1 ${
                                  usr.is_verified
                                    ? 'bg-green-100 hover:bg-green-200 text-green-700'
                                    : (usr.profile_complete_percent || 0) < 90
                                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                      : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                                }`}
                                title={
                                  !usr.is_verified && (usr.profile_complete_percent || 0) < 90
                                    ? 'Profile must be 90% complete to verify'
                                    : usr.is_verified
                                      ? 'Unverify User'
                                      : 'Verify User'
                                }
                              >
                                {usr.is_verified ? (
                                  <FaCheck className="h-3 w-3" />
                                ) : (
                                  <FaTimes className="h-3 w-3" />
                                )}
                                <span>{usr.is_verified ? 'Verified' : 'Verify'}</span>
                              </button>
                              <button
                                onClick={() => openEditModal(usr)}
                                className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1"
                                title="Edit User"
                              >
                                <FaEdit className="h-3 w-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => openRoleModal(usr)}
                                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all text-xs font-semibold"
                                title="Manage Roles"
                              >
                                Roles
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1"
                                title="Delete User"
                              >
                                <FaTrash className="h-3 w-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleRestoreUser(usr.id)}
                                className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1"
                                title="Restore User"
                              >
                                <FaUndo className="h-3 w-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handleForceDelete(usr.id)}
                                className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-xs font-semibold flex items-center space-x-1"
                                title="Force Delete User"
                              >
                                <FaSkull className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUsers;
