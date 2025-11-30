import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  FaCar,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaCalendarAlt,
  FaUser,
  FaClock,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaImage,
  FaCheck,
  FaTimes,
  FaUndo,
  FaInfoCircle,
  FaSkull,
  FaExclamationTriangle,
} from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import Header from '../components/Header';

const CarList = () => {
  useNavigate();
  const { user } = useAuthStore();
  const [cars, setCars] = useState([]);
  const [approvedCars, setApprovedCars] = useState([]);
  const [rejectedCars, setRejectedCars] = useState([]);
  const [trashedCars, setTrashedCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'approved', 'rejected', 'trashed'
  const searchTimeoutRef = useRef(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    condition: 'used',
    location: '',
    description: '',
  });

  // Image upload state
  const [uploadingImages, setUploadingImages] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [selectedImages, setSelectedImages] = useState({});
  const [formImages, setFormImages] = useState([]);

  // Image carousel state
  const [imageIndex, setImageIndex] = useState({});

  // Moderation state
  const [moderatingCar, setModeratingSar] = useState(null);

  // Detail modal state
  const [selectedCar, setSelectedCar] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      await fetchCars('');
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchCars = async (query) => {
    try {
      setLoadingCars(true);
      if (activeTab === 'approved') {
        const response = await api.get('/cars-approved', {
          params: { per_page: 50, q: query || undefined },
        });
        setApprovedCars(response.data.data || []);
      } else if (activeTab === 'rejected') {
        const response = await api.get('/cars-rejected', {
          params: { per_page: 50, q: query || undefined },
        });
        setRejectedCars(response.data.data || []);
      } else if (activeTab === 'trashed') {
        const response = await api.get('/cars-trashed', {
          params: { per_page: 50, q: query || undefined },
        });
        setTrashedCars(response.data.data || []);
      } else {
        const response = await api.get('/cars', {
          params: { per_page: 50, q: query || undefined },
        });
        setCars(response.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to load cars');
    } finally {
      setLoadingCars(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      fetchCars(query);
    }, 500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let carId;

      if (editingCar) {
        // Update
        await api.put(`/cars/${editingCar.id}`, formData);
        carId = editingCar.id;
      } else {
        // Create
        const response = await api.post('/cars', formData);
        carId = response.data.data?.id || response.data.id;
      }

      // Upload images if any selected
      let imagesUploaded = false;
      if (formImages.length > 0 && carId) {
        for (const file of formImages) {
          const imgFormData = new FormData();
          imgFormData.append('image', file);
          try {
            await api.post(`/cars/${carId}/upload-image`, imgFormData);
            imagesUploaded = true;
          } catch (imgErr) {
            console.error('Error uploading image:', imgErr);
            // Don't fail the whole operation if one image fails
          }
        }
      }

      // Reset form
      setShowForm(false);
      setEditingCar(null);
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        mileage: '',
        condition: 'used',
        location: '',
        description: '',
      });
      setFormImages([]);

      // Add delay if images were uploaded to ensure backend processes them
      if (imagesUploaded) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Fetch updated cars list
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error saving car:', err);
      setFormError(err.response?.data?.message || 'Failed to save car');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage || '',
      condition: car.condition,
      location: car.location || '',
      description: car.description || '',
    });
    setFormImages([]); // Reset new images to add
    setShowForm(true);
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;

    try {
      await api.delete(`/cars/${carId}`);
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error deleting car:', err);
      alert('Failed to delete car');
    }
  };

  const handleImageUpload = async (carId, files) => {
    if (!files.length) return;

    setUploadingImages((prev) => ({ ...prev, [carId]: true }));

    try {
      // Upload images one by one
      for (const file of Array.from(files)) {
        const formDataImg = new FormData();
        formDataImg.append('image', file);

        await api.post(`/cars/${carId}/upload-image`, formDataImg);
      }

      // Clear selected images and refresh
      setSelectedImages((prev) => ({ ...prev, [carId]: [] }));
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error uploading images:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Failed to upload images: ${errorMsg}`);
    } finally {
      setUploadingImages((prev) => ({ ...prev, [carId]: false }));
    }
  };

  const handleDeleteImage = async (carId, imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/cars/${carId}/images/${imageId}`);
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error deleting image:', err);
      alert('Failed to delete image');
    }
  };

  const handleApproveCar = async (carId) => {
    setModeratingSar(carId);
    try {
      await api.patch(`/cars/${carId}/approve`);
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error approving car:', err);
      alert('Failed to approve car');
    } finally {
      setModeratingSar(null);
    }
  };

  const handleRejectCar = async (carId) => {
    const reason = prompt('Enter rejection reason (required):');
    if (!reason || reason.trim() === '') {
      alert('Rejection reason is required');
      return;
    }

    setModeratingSar(carId);
    try {
      await api.patch(`/cars/${carId}/reject`, { reason: reason.trim() });
      fetchCars(searchQuery);
      alert('Car rejected successfully');
    } catch (err) {
      console.error('Error rejecting car:', err);
      alert(`Failed to reject car: ${err.response?.data?.message || 'Unknown error'}`);
    } finally {
      setModeratingSar(null);
    }
  };

  const handleRestoreCar = async (carId) => {
    try {
      await api.patch(`/cars/${carId}/restore`);
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error restoring car:', err);
      alert('Failed to restore car');
    }
  };

  const handleForceDelete = async (carId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      await api.delete(`/cars/${carId}/force`);
      fetchCars(searchQuery);
    } catch (err) {
      console.error('Error force deleting car:', err);
      alert('Failed to force delete car');
    }
  };

  const getConditionColor = (condition) => {
    const colors = {
      new: 'bg-green-100 text-green-800',
      used: 'bg-blue-100 text-blue-800',
      certified: 'bg-purple-100 text-purple-800',
    };
    return colors[condition] || colors.used;
  };

  const getStatusColor = (status) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || colors.pending;
  };

  const currentCars =
    activeTab === 'approved'
      ? approvedCars
      : activeTab === 'rejected'
        ? rejectedCars
        : activeTab === 'trashed'
          ? trashedCars
          : cars;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="Car List Management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setActiveTab('active');
                  setSearchQuery('');
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Active Listings
              </button>
              <button
                onClick={() => {
                  setActiveTab('approved');
                  setSearchQuery('');
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'approved'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Approved ({approvedCars.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('rejected');
                  setSearchQuery('');
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'rejected'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Rejected ({rejectedCars.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('trashed');
                  setSearchQuery('');
                }}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'trashed'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Deleted ({trashedCars.length})
              </button>
            </div>
            {activeTab === 'active' && user?.permissions?.includes('cars.create') && (
              <button
                onClick={() => {
                  setEditingCar(null);
                  setFormData({
                    make: '',
                    model: '',
                    year: new Date().getFullYear(),
                    price: '',
                    mileage: '',
                    condition: 'used',
                    location: '',
                    description: '',
                  });
                  setShowForm(!showForm);
                }}
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                <FaPlus className="h-4 w-4" />
                <span>Add New Listing</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by make, model, or description..."
              className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 shadow-sm transition-all"
            />
            <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showForm && activeTab === 'active' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCar ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingCar(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {formError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-600">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Make *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Toyota"
                        required
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Camry"
                        required
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        placeholder="2024"
                        required
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: parseInt(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        placeholder="25000"
                        required
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: parseFloat(e.target.value) })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mileage (km)
                      </label>
                      <input
                        type="number"
                        placeholder="50000"
                        value={formData.mileage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            mileage: e.target.value ? parseInt(e.target.value) : '',
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Condition *
                      </label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="certified">Certified</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Add details about the car..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="4"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Images</label>

                    {/* Existing Images (when editing) */}
                    {editingCar && editingCar.images && editingCar.images.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Existing images:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {editingCar.images.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt="car"
                                className="w-full h-24 object-cover rounded-lg border border-gray-300"
                              />
                              <span className="absolute top-1 left-1 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                Existing
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upload New Images */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) =>
                          setFormImages([...formImages, ...Array.from(e.target.files || [])])
                        }
                        className="hidden"
                        id="form-images"
                      />
                      <label htmlFor="form-images" className="cursor-pointer">
                        <div className="flex flex-col items-center space-y-2">
                          <FaImage className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-700">
                              Click to add images
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* New Images Preview */}
                    {formImages.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-gray-700">
                          {formImages.length} new image(s):
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {formImages.map((file, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt="preview"
                                className="w-full h-24 object-cover rounded-lg border border-blue-300"
                              />
                              <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                New
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormImages(formImages.filter((_, i) => i !== idx))
                                }
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCar(null);
                      }}
                      className="flex-1 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      {formLoading ? (
                        <>
                          <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{editingCar ? 'Update Listing' : 'Create Listing'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail View Modal */}
        {selectedCar && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCar.make} {selectedCar.model}
                </h2>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Image Gallery */}
                {selectedCar.images?.length > 0 && (
                  <div className="relative h-80 bg-gray-200 overflow-hidden rounded-xl flex items-center justify-center group">
                    <img
                      src={selectedCar.images[detailImageIndex]?.url}
                      alt={`${selectedCar.make} ${selectedCar.model}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Image Counter */}
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-lg font-semibold">
                      {detailImageIndex + 1} / {selectedCar.images.length}
                    </div>

                    {/* Navigation Arrows */}
                    {selectedCar.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setDetailImageIndex(
                              detailImageIndex > 0
                                ? detailImageIndex - 1
                                : selectedCar.images.length - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all"
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            setDetailImageIndex(
                              detailImageIndex < selectedCar.images.length - 1
                                ? detailImageIndex + 1
                                : 0
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all"
                        >
                          ›
                        </button>

                        {/* Image Dots */}
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                          {selectedCar.images.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setDetailImageIndex(idx)}
                              className={`h-2 rounded-full transition-all ${
                                idx === detailImageIndex
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 w-2 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    <div
                      className={`absolute top-3 right-3 px-4 py-2 rounded-full text-sm font-bold ${getConditionColor(selectedCar.condition)}`}
                    >
                      {selectedCar.condition.charAt(0).toUpperCase() +
                        selectedCar.condition.slice(1)}
                    </div>
                  </div>
                )}

                {/* Price and Basic Info */}
                <div className="border-b border-gray-200 pb-4">
                  <p className="text-4xl font-bold text-blue-600 mb-4">
                    ${selectedCar.price.toLocaleString()}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Year</p>
                        <p className="font-semibold text-gray-900">{selectedCar.year}</p>
                      </div>
                    </div>
                    {selectedCar.mileage && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaTachometerAlt className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Mileage</p>
                          <p className="font-semibold text-gray-900">
                            {selectedCar.mileage.toLocaleString()} km
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCar.location && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaMapMarkerAlt className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="font-semibold text-gray-900">{selectedCar.location}</p>
                        </div>
                      </div>
                    )}
                    {selectedCar.seller?.name && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaUser className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Seller</p>
                          <p className="font-semibold text-gray-900">{selectedCar.seller.name}</p>
                        </div>
                      </div>
                    )}
                    {selectedCar.created_at && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaClock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Listed</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedCar.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCar.status && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div
                          className={`h-3 w-3 rounded-full ${selectedCar.status === 'approved' ? 'bg-green-600' : selectedCar.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'}`}
                        ></div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <p className="font-semibold text-gray-900">
                            {selectedCar.status.charAt(0).toUpperCase() +
                              selectedCar.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedCar.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-red-700 mb-2 flex items-center space-x-2">
                      <FaExclamationTriangle className="text-red-600" />
                      <span>Rejection Reason</span>
                    </h3>
                    <p className="text-red-600 leading-relaxed">{selectedCar.rejection_reason}</p>
                  </div>
                )}

                {/* Description */}
                {selectedCar.description && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center space-x-2">
                      <FaInfoCircle className="text-blue-600" />
                      <span>Description</span>
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedCar.description}</p>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setSelectedCar(null)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cars List */}
        {loadingCars ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <AiOutlineLoading3Quarters className="animate-spin h-12 w-12 text-blue-600" />
              <p className="text-gray-600">Loading listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => fetchCars(searchQuery)}
              className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : currentCars.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <FaCar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium">No listings yet.</p>
            <p className="text-gray-500 text-sm">Start by creating your first listing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCars.map((car) => {
              const coverImageIndex = car.images?.findIndex((img) => img.is_cover) ?? -1;
              const defaultImageIndex = coverImageIndex >= 0 ? coverImageIndex : 0;
              const currentImageIndex =
                imageIndex[car.id] !== undefined ? imageIndex[car.id] : defaultImageIndex;

              return (
                <div
                  key={car.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
                >
                  {/* Car Image Carousel */}
                  <div
                    onClick={() => {
                      setSelectedCar(car);
                      setDetailImageIndex(0);
                    }}
                    className="relative h-48 bg-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer"
                  >
                    {car.images?.length > 0 ? (
                      <>
                        <img
                          src={car.images[currentImageIndex]?.url}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded font-semibold">
                          {currentImageIndex + 1} / {car.images.length}
                        </div>

                        {/* Navigation Arrows */}
                        {car.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageIndex((prev) => ({
                                  ...prev,
                                  [car.id]:
                                    currentImageIndex > 0
                                      ? currentImageIndex - 1
                                      : car.images.length - 1,
                                }));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageIndex((prev) => ({
                                  ...prev,
                                  [car.id]:
                                    currentImageIndex < car.images.length - 1
                                      ? currentImageIndex + 1
                                      : 0,
                                }));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-gray-300 to-gray-400">
                        <FaCar className="h-16 w-16 text-gray-500 mb-2" />
                        <p className="text-gray-600 text-sm font-medium">No image</p>
                      </div>
                    )}
                    <div
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${getConditionColor(car.condition)}`}
                    >
                      {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3
                        className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => {
                          setSelectedCar(car);
                          setDetailImageIndex(0);
                        }}
                      >
                        {car.make} <span className="text-gray-500">{car.model}</span>
                      </h3>
                      {car.status && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${getStatusColor(car.status)}`}
                        >
                          {car.status}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="h-3.5 w-3.5 text-blue-600" />
                        <span>{car.year}</span>
                      </div>
                      {car.mileage && (
                        <div className="flex items-center space-x-2">
                          <FaTachometerAlt className="h-3.5 w-3.5 text-blue-600" />
                          <span>{car.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {car.location && (
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="h-3.5 w-3.5 text-blue-600" />
                          <span>{car.location}</span>
                        </div>
                      )}
                      {car.seller?.name && (
                        <div className="flex items-center space-x-2">
                          <FaUser className="h-3.5 w-3.5 text-blue-600" />
                          <span>{car.seller.name}</span>
                        </div>
                      )}
                      {activeTab === 'trashed' && car.deleted_at ? (
                        <div className="flex items-center space-x-2">
                          <FaSkull className="h-3.5 w-3.5 text-red-600" />
                          <span>{new Date(car.deleted_at).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        car.created_at && (
                          <div className="flex items-center space-x-2">
                            <FaClock className="h-3.5 w-3.5 text-blue-600" />
                            <span>{new Date(car.created_at).toLocaleDateString()}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Description */}
                    {car.description && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-gray-700 line-clamp-2">{car.description}</p>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 mb-3">
                      <p className="text-2xl font-bold text-blue-600">
                        ${car.price.toLocaleString()}
                      </p>
                    </div>

                    {/* Image Management */}
                    {activeTab === 'active' && user?.permissions?.includes('cars.update') && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center space-x-2">
                          <label className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all text-sm font-semibold text-blue-600">
                            <FaImage className="h-4 w-4" />
                            <span>Upload</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => handleImageUpload(car.id, e.target.files)}
                              disabled={uploadingImages[car.id]}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {car.images?.slice(0, 2).map((image) => (
                          <div
                            key={image.id}
                            className="flex items-center justify-between bg-gray-50 p-2.5 rounded text-xs"
                          >
                            <div className="flex items-center space-x-2 flex-1">
                              <img
                                src={image.url}
                                alt="preview"
                                className="w-8 h-8 object-cover rounded"
                              />
                              {image.is_cover && (
                                <span className="text-green-600 font-semibold text-xs">★</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteImage(car.id, image.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rejection Reason (for rejected tab) */}
                    {activeTab === 'rejected' && car.rejection_reason && (
                      <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start space-x-2">
                          <FaExclamationTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-red-700">Rejection Reason:</p>
                            <p className="text-sm text-red-600 mt-1">{car.rejection_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                      {activeTab === 'active' ? (
                        <>
                          {car.status === 'pending' &&
                            user?.permissions?.includes('cars.moderate') && (
                              <div className="flex space-x-2 text-xs">
                                <button
                                  onClick={() => handleApproveCar(car.id)}
                                  disabled={moderatingCar === car.id}
                                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all disabled:opacity-50 font-semibold"
                                >
                                  {moderatingCar === car.id ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                  ) : (
                                    <FaCheck />
                                  )}
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectCar(car.id)}
                                  disabled={moderatingCar === car.id}
                                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all disabled:opacity-50 font-semibold"
                                >
                                  {moderatingCar === car.id ? (
                                    <AiOutlineLoading3Quarters className="animate-spin" />
                                  ) : (
                                    <FaTimes />
                                  )}
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}
                          {user?.permissions?.includes('cars.update') && (
                            <div className="flex space-x-2 text-xs">
                              <button
                                onClick={() => handleEditCar(car)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all font-semibold"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteCar(car.id)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-semibold"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </>
                      ) : activeTab === 'approved' ? (
                        <div className="flex space-x-2 text-xs">
                          {user?.permissions?.includes('cars.update') && (
                            <button
                              onClick={() => handleEditCar(car)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all font-semibold"
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </button>
                          )}
                          {user?.permissions?.includes('cars.delete') && (
                            <button
                              onClick={() => handleDeleteCar(car.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-semibold"
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      ) : activeTab === 'rejected' ? (
                        <div className="flex space-x-2 text-xs">
                          {user?.permissions?.includes('cars.update') && (
                            <button
                              onClick={() => handleEditCar(car)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all font-semibold"
                            >
                              <FaEdit className="h-3.5 w-3.5" />
                              <span>Edit & Resubmit</span>
                            </button>
                          )}
                          {user?.permissions?.includes('cars.delete') && (
                            <button
                              onClick={() => handleDeleteCar(car.id)}
                              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-semibold"
                            >
                              <FaTrash className="h-3.5 w-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex space-x-2 text-xs">
                          {user?.permissions?.includes('cars.delete') && (
                            <>
                              <button
                                onClick={() => handleRestoreCar(car.id)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all font-semibold"
                              >
                                <FaUndo className="h-3.5 w-3.5" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handleForceDelete(car.id)}
                                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all font-semibold"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                                <span>Force Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CarList;
