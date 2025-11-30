import { useNavigate } from 'react-router-dom';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import {
  FaCar,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaCalendarAlt,
  FaSearch,
  FaUser,
  FaClock,
  FaInfoCircle,
  FaFilter,
  FaTimes,
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { useEffect, useState, useRef } from 'react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';
import Header from '../components/Header';

const Home = () => {
  useNavigate();
  useAuthStore();
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const [detailSlideDirection, setDetailSlideDirection] = useState('right');
  const [sortBy, setSortBy] = useState('recent');
  const [cardSlideDirection, setCardSlideDirection] = useState({});
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    fetchPublicCars('');
  }, []);

  const fetchPublicCars = async (query) => {
    try {
      setLoadingCars(true);
      const response = await api.get('/public/cars', {
        params: {
          per_page: 12,
          q: query || undefined,
        },
      });
      setCars(response.data.data || []);
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

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search - wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      fetchPublicCars(query);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchPublicCars('');
  };

  const [imageIndex, setImageIndex] = useState({});

  const getConditionColor = (condition) => {
    const colors = {
      new: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      used: 'bg-sky-100 text-sky-700 border border-sky-200',
      certified: 'bg-violet-100 text-violet-700 border border-violet-200',
    };
    return colors[condition] || colors.used;
  };

  const getSortedCars = () => {
    const sorted = [...cars];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'year':
        return sorted.sort((a, b) => b.year - a.year);
      case 'recent':
      default:
        return sorted;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header title="Car Market Hub" />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 border-b border-gray-200/20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fill-opacity=%270.1%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-12 bg-white/40 rounded-full"></div>
              <span className="text-white/80 text-sm font-semibold tracking-widest">
                PREMIUM VEHICLES
              </span>
              <div className="h-1 w-12 bg-white/40 rounded-full"></div>
            </div>

            <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tight">
              Car Market Hub
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover premium vehicles with transparent pricing, detailed specifications, and
              trusted sellers
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by make, model, or description..."
                  className="w-full px-6 pr-12 py-4 rounded-2xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-900 placeholder-gray-500 shadow-2xl transition-all duration-200"
                />
                {searchQuery ? (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 hover:bg-gray-200 rounded-full"
                    title="Clear search"
                  >
                    <FaTimes className="h-full w-full" />
                  </button>
                ) : (
                  <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-white">{cars.length}</p>
                <p className="text-white/70 text-sm">Vehicles</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-white">100%</p>
                <p className="text-white/70 text-sm">Verified</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-3xl font-bold text-white">24/7</p>
                <p className="text-white/70 text-sm">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail View Modal */}
      {selectedCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 border-b border-gray-200 px-6 py-6 flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white">
                  {selectedCar.make} {selectedCar.model}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedCar.year} • {selectedCar.condition}
                </p>
              </div>
              <button
                onClick={() => setSelectedCar(null)}
                className="text-white hover:bg-white/20 py-2 px-5 rounded-full text-2xl transition-all hover:scale-110"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image Gallery */}
              {selectedCar.images?.length > 0 && (
                <div className="relative h-96 bg-gray-200 overflow-hidden rounded-xl flex items-center justify-center group">
                  {/* Current Image */}
                  <img
                    src={selectedCar.images[detailImageIndex]?.url}
                    alt={`${selectedCar.make} ${selectedCar.model}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay Slide Image */}
                  <img
                    key={detailImageIndex}
                    src={selectedCar.images[detailImageIndex]?.url}
                    alt={`${selectedCar.make} ${selectedCar.model}`}
                    className={`absolute inset-0 w-full h-full object-cover ${detailSlideDirection === 'left' ? 'animate-slideLeft' : 'animate-slideRight'}`}
                  />

                  {/* Image Counter */}
                  <div className="absolute bottom-3 left-3 bg-black/60 text-white text-sm px-3 py-1 rounded-lg font-semibold">
                    {detailImageIndex + 1} / {selectedCar.images.length}
                  </div>

                  {/* Navigation Arrows */}
                  {selectedCar.images.length > 1 && (
                    <>
                      <button
                        onClick={() => {
                          setDetailSlideDirection('right');
                          setDetailImageIndex(
                            detailImageIndex > 0
                              ? detailImageIndex - 1
                              : selectedCar.images.length - 1
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-lg"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => {
                          setDetailSlideDirection('left');
                          setDetailImageIndex(
                            detailImageIndex < selectedCar.images.length - 1
                              ? detailImageIndex + 1
                              : 0
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full transition-all shadow-lg"
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
                    {selectedCar.condition.charAt(0).toUpperCase() + selectedCar.condition.slice(1)}
                  </div>
                </div>
              )}

              {/* Price and Basic Info */}
              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
                  <p className="text-sm text-gray-600 font-semibold mb-2">ASKING PRICE</p>
                  <p className="text-5xl font-black gradient-text">
                    ${selectedCar.price.toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                        <p className="font-semibold text-gray-900 flex items-center space-x-2">
                          <span>{selectedCar.seller.name}</span>
                          {selectedCar.seller.is_verified && (
                            <MdVerified
                              className="h-5 w-5 text-green-500"
                              title="Verified Seller"
                            />
                          )}
                        </p>
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
                </div>
              </div>

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

              {/* Back Button */}
              <button
                onClick={() => setSelectedCar(null)}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-all"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Filter and Sort Section */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFilter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Sort by:</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                sortBy === 'recent'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('price-low')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                sortBy === 'price-low'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => setSortBy('price-high')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                sortBy === 'price-high'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Price: High to Low
            </button>
            <button
              onClick={() => setSortBy('year')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                sortBy === 'year'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Newest Year
            </button>
          </div>
        </div>

        {loadingCars ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <AiOutlineLoading3Quarters className="animate-spin h-12 w-12 text-blue-600" />
              <p className="text-gray-600">Loading vehicles...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-600 font-semibold">{error}</p>
            <button
              onClick={() => fetchPublicCars(searchQuery)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <FaCar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No vehicles available at the moment.
            </p>
            <p className="text-gray-500 mt-2">Check back soon for new listings</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedCars().map((car) => {
              const coverImageIndex = car.images?.findIndex((img) => img.is_cover) ?? -1;
              const defaultImageIndex = coverImageIndex >= 0 ? coverImageIndex : 0;
              const currentImageIndex =
                imageIndex[car.id] !== undefined ? imageIndex[car.id] : defaultImageIndex;

              return (
                <div
                  key={car.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group flex flex-col"
                >
                  {/* Car Image Carousel */}
                  <div
                    onClick={() => {
                      setSelectedCar(car);
                      setDetailImageIndex(0);
                    }}
                    className="relative h-56 bg-gray-200 overflow-hidden flex items-center justify-center group cursor-pointer"
                  >
                    {car.images?.length > 0 ? (
                      <>
                        {/* Current Image */}
                        <img
                          src={car.images[currentImageIndex]?.url}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105"
                        />

                        {/* Overlay Slide Image */}
                        <img
                          key={currentImageIndex}
                          src={car.images[currentImageIndex]?.url}
                          alt={`${car.make} ${car.model}`}
                          className={`absolute inset-0 w-full h-full object-cover ${cardSlideDirection[car.id] === 'left' ? 'animate-slideLeft' : 'animate-slideRight'}`}
                        />

                        {/* Image Counter */}
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          {currentImageIndex + 1} / {car.images.length}
                        </div>

                        {/* Navigation Arrows */}
                        {car.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardSlideDirection((prev) => ({ ...prev, [car.id]: 'right' }));
                                setImageIndex((prev) => ({
                                  ...prev,
                                  [car.id]:
                                    currentImageIndex > 0
                                      ? currentImageIndex - 1
                                      : car.images.length - 1,
                                }));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCardSlideDirection((prev) => ({ ...prev, [car.id]: 'left' }));
                                setImageIndex((prev) => ({
                                  ...prev,
                                  [car.id]:
                                    currentImageIndex < car.images.length - 1
                                      ? currentImageIndex + 1
                                      : 0,
                                }));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                            >
                              ›
                            </button>

                            {/* Image Dots */}
                            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                              {car.images.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageIndex((prev) => ({ ...prev, [car.id]: idx }));
                                  }}
                                  className={`h-2 rounded-full transition-all ${
                                    idx === currentImageIndex
                                      ? 'bg-white w-6'
                                      : 'bg-white/50 w-2 hover:bg-white/70'
                                  }`}
                                />
                              ))}
                            </div>
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
                      className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold ${getConditionColor(car.condition)}`}
                    >
                      {car.condition.charAt(0).toUpperCase() + car.condition.slice(1)}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {car.make} <span className="text-gray-500">{car.model}</span>
                    </h3>

                    <div className="space-y-1 mb-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="h-3 w-3 text-blue-600" />
                        <span>{car.year}</span>
                      </div>
                      {car.mileage && (
                        <div className="flex items-center space-x-2">
                          <FaTachometerAlt className="h-3 w-3 text-blue-600" />
                          <span>{car.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {car.location && (
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="h-3 w-3 text-blue-600" />
                          <span>{car.location}</span>
                        </div>
                      )}
                    </div>

                    {car.description && (
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <p className="text-sm text-gray-700 line-clamp-2">{car.description}</p>
                      </div>
                    )}

                    <div className="space-y-1 mb-3 text-xs text-gray-500">
                      {car.seller?.name && (
                        <div className="flex items-center space-x-2">
                          <FaUser className="h-3 w-3 text-gray-500" />
                          <span className="flex items-center space-x-1">
                            <span>{car.seller.name}</span>
                            {car.seller.is_verified && (
                              <MdVerified
                                className="h-3.5 w-3.5 text-green-500"
                                title="Verified Seller"
                              />
                            )}
                          </span>
                        </div>
                      )}
                      {car.created_at && (
                        <div className="flex items-center space-x-2">
                          <FaClock className="h-3 w-3 text-gray-500" />
                          <span>
                            {new Date(car.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 mb-4 border border-blue-100">
                        <p className="text-xs text-gray-600 font-semibold mb-1">PRICE</p>
                        <p className="text-3xl font-black gradient-text">
                          ${car.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedCar(car);
                          setDetailImageIndex(0);
                        }}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-smooth shadow-md hover:shadow-lg hover:scale-105 active:scale-95 btn-focus"
                      >
                        View Details
                      </button>
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

export default Home;
