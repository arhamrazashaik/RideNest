import React from 'react';
import { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaMoneyBillWave, FaArrowRight, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { GoogleMap, Marker, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import AuthContext from '../context/AuthContext';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 12.9716, // Bangalore default
  lng: 77.5946,
};

const savedLocations = [
  { name: 'Home', address: '10-1-622/A, Amrutha Nilayam, Bhagyanagar, Karimnagar -505001.', coordinates: { lat: 18.4386, lng: 79.1288 } },
  { name: 'Work', address: '456 Office Park, Business District', coordinates: { lat: 12.9762, lng: 77.6033 } },
];

// Fare calculation parameters
const BASE_FARE = 30; // ₹
const PER_KM_RATE = 8; // ₹ per km
const PER_MIN_RATE = 1; // ₹ per min
const VEHICLE_MULTIPLIERS = {
  Sedan: 1,
  SUV: 1.2,
  Van: 1.5,
};
const MINIMUM_FARE = 75; // ₹

// Hardcoded optimization info for demo
const demoOptimization = {
  originalRoute: {
    distance: 28,
    time: 1.2,
    cost: 600,
    fuel: 4.5,
    co2: 10,
  },
  optimizedRoute: {
    distance: 22,
    time: 0.9,
    cost: 450,
    fuel: 3.2,
    co2: 7,
  },
};

function calculateFare(distanceMeters, durationSeconds, vehicleType) {
  const distanceKm = distanceMeters / 1000;
  const durationMin = durationSeconds / 60;
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1;
  let fare = BASE_FARE + (distanceKm * PER_KM_RATE) + (durationMin * PER_MIN_RATE);
  fare *= multiplier;
  if (fare < MINIMUM_FARE) fare = MINIMUM_FARE;
  return Math.round(fare);
}

const BookRide = () => {
  const [step, setStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pickup, setPickup] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destination, setDestination] = useState('');
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [directions, setDirections] = useState(null);
  const [mapClickLatLng, setMapClickLatLng] = useState(null);
  const [showMapClickPrompt, setShowMapClickPrompt] = useState(false);
  const [mapClickLoading, setMapClickLoading] = useState(false);
  const [rideType, setRideType] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [estimatedFare, setEstimatedFare] = useState('');
  const [estimatedFarePerPerson, setEstimatedFarePerPerson] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [numPassengers, setNumPassengers] = useState(4);
  const [vehicleError, setVehicleError] = useState('');
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const mapRef = useRef();
  const navigate = useNavigate();
  const { mongoUserId } = useContext(AuthContext);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });

  // Handle map click
  const handleMapClick = async (e) => {
    const latLng = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setMapClickLatLng(latLng);
    setShowMapClickPrompt(true);
  };

  // Reverse geocode lat/lng to address
  const reverseGeocode = (latLng, callback) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        callback(results[0].formatted_address);
      } else {
        callback('Selected Location');
      }
    });
  };

  // Effect to get directions when both pickup and destination are set
  useEffect(() => {
    if (pickupCoords && destinationCoords && isLoaded) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickupCoords,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            setDirections(null);
          }
        }
      );
    } else {
      setDirections(null);
    }
  }, [pickupCoords, destinationCoords, isLoaded]);

  // Update fare when directions or vehicle changes
  useEffect(() => {
    if (directions && selectedVehicle) {
      const leg = directions.routes[0]?.legs[0];
      if (leg) {
        const fare = calculateFare(leg.distance.value, leg.duration.value, selectedVehicle);
        setEstimatedFare(fare);
        setEstimatedFarePerPerson(numPassengers > 0 ? Math.round(fare / numPassengers) : fare);
      }
    } else {
      setEstimatedFare('');
      setEstimatedFarePerPerson('');
    }
  }, [directions, selectedVehicle, numPassengers]);

  const handleBookRide = async () => {
    // Remove backend/auth logic, just show modal
    setShowOptimizationModal(true);
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold text-gray-900 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Book a Group Ride
      </motion.h1>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">New Ride Request</h2>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= stepNumber ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                    animate={{
                      scale: step === stepNumber ? [1, 1.1, 1] : 1,
                      backgroundColor: step >= stepNumber ? '#2563eb' : '#e5e7eb',
                      color: step >= stepNumber ? '#ffffff' : '#4b5563'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {stepNumber}
                  </motion.div>
                  {stepNumber < 3 && (
                    <motion.div
                      className="w-16 h-1 mx-2"
                      animate={{
                        backgroundColor: step > stepNumber ? '#2563eb' : '#e5e7eb'
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <FaCar className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Ride Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ride Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={rideType}
                      onChange={e => setRideType(e.target.value)}
                    >
                      <option value="">Select Ride Type</option>
                      <option value="Office Commute">Office Commute</option>
                      <option value="Event Transportation">Event Transportation</option>
                      <option value="Tour Group">Tour Group</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                    <select className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                      <option>Instant Booking</option>
                      <option>Scheduled</option>
                      <option>Recurring</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={e => setDateTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Passengers</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={numPassengers}
                      onChange={e => setNumPassengers(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Preference</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                      {[
                        { name: 'Sedan', capacity: '4 passengers' },
                        { name: 'SUV', capacity: '6 passengers' },
                        { name: 'Van', capacity: '12 passengers' }
                      ].map((vehicle, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors duration-300 ${
                            selectedVehicle === vehicle.name
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
                          }`}
                          onClick={() => setSelectedVehicle(vehicle.name)}
                        >
                          <div className="font-medium">{vehicle.name}</div>
                          <div className="text-sm text-gray-500">{vehicle.capacity}</div>
                          {selectedVehicle === vehicle.name && (
                            <div className="mt-2 text-primary-600 flex items-center">
                              <FaCheckCircle className="mr-1" /> Selected
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <FaMapMarkerAlt className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pickup & Destination</h3>
                </div>

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                    <PlacesAutocomplete
                      value={pickup}
                      onChange={setPickup}
                      onSelect={async (address) => {
                        setPickup(address);
                        const results = await geocodeByAddress(address);
                        const latLng = await getLatLng(results[0]);
                        setPickupCoords(latLng);
                      }}
                    >
                      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                          <input
                            {...getInputProps({
                              placeholder: 'Enter pickup address',
                              className: 'flex-1 border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 w-full',
                            })}
                          />
                          <div className="absolute z-10 bg-white border border-gray-200 w-full rounded-b-md shadow">
                            {loading && <div className="p-2 text-gray-500">Loading...</div>}
                            {suggestions.map((suggestion, idx) => {
                              const className = suggestion.active
                                ? 'p-2 bg-primary-100 cursor-pointer'
                                : 'p-2 cursor-pointer';
                              return (
                                <div key={idx} {...getSuggestionItemProps(suggestion, { className })}>
                                  {suggestion.description}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </PlacesAutocomplete>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <PlacesAutocomplete
                      value={destination}
                      onChange={setDestination}
                      onSelect={async (address) => {
                        setDestination(address);
                        const results = await geocodeByAddress(address);
                        const latLng = await getLatLng(results[0]);
                        setDestinationCoords(latLng);
                      }}
                    >
                      {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                        <div>
                          <input
                            {...getInputProps({
                              placeholder: 'Enter destination address',
                              className: 'w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500',
                            })}
                          />
                          <div className="absolute z-10 bg-white border border-gray-200 w-full rounded-b-md shadow">
                            {loading && <div className="p-2 text-gray-500">Loading...</div>}
                            {suggestions.map((suggestion, idx) => {
                              const className = suggestion.active
                                ? 'p-2 bg-primary-100 cursor-pointer'
                                : 'p-2 cursor-pointer';
                              return (
                                <div key={idx} {...getSuggestionItemProps(suggestion, { className })}>
                                  {suggestion.description}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </PlacesAutocomplete>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Saved Locations</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {savedLocations.map((location, index) => (
                        <div
                          key={index}
                          className={`border border-gray-300 rounded-lg p-4 transition-colors duration-300`}
                        >
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500 mb-2">{location.address}</div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs"
                              onClick={() => {
                                setPickup(location.address);
                                setPickupCoords(location.coordinates);
                              }}
                            >
                              Use as Pickup
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                              onClick={() => {
                                setDestination(location.address);
                                setDestinationCoords(location.coordinates);
                              }}
                            >
                              Use as Destination
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Map Preview</label>
                    <div className="bg-gray-100 p-4 rounded-lg text-center" style={{ position: 'relative' }}>
                      {isLoaded ? (
                        <>
                          <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={pickupCoords || destinationCoords || defaultCenter}
                            zoom={pickupCoords || destinationCoords ? 13 : 11}
                            onClick={handleMapClick}
                            onLoad={map => (mapRef.current = map)}
                          >
                            {pickupCoords && <Marker position={pickupCoords} label="P" />}
                            {destinationCoords && <Marker position={destinationCoords} label="D" />}
                            {directions && <DirectionsRenderer directions={directions} />}
                          </GoogleMap>
                          {/* Map click prompt */}
                          {showMapClickPrompt && mapClickLatLng && (
                            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} className="bg-white border border-gray-300 rounded shadow p-4 flex flex-col items-center">
                              <div className="mb-2">Use this location as:</div>
                              <div className="flex gap-2">
                                <button
                                  className="px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-xs"
                                  disabled={mapClickLoading}
                                  onClick={() => {
                                    setMapClickLoading(true);
                                    reverseGeocode(mapClickLatLng, (address) => {
                                      setPickup(address);
                                      setPickupCoords(mapClickLatLng);
                                      setShowMapClickPrompt(false);
                                      setMapClickLoading(false);
                                    });
                                  }}
                                >
                                  Pickup
                                </button>
                                <button
                                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                  disabled={mapClickLoading}
                                  onClick={() => {
                                    setMapClickLoading(true);
                                    reverseGeocode(mapClickLatLng, (address) => {
                                      setDestination(address);
                                      setDestinationCoords(mapClickLatLng);
                                      setShowMapClickPrompt(false);
                                      setMapClickLoading(false);
                                    });
                                  }}
                                >
                                  Destination
                                </button>
                                <button
                                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
                                  disabled={mapClickLoading}
                                  onClick={() => {
                                    setShowMapClickPrompt(false);
                                    setMapClickLatLng(null);
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div>Loading map...</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <FaCheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Review & Confirm</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                  <h4 className="font-medium text-lg mb-4">Ride Summary</h4>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ride Type:</span>
                      <span className="font-medium">{rideType || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Date & Time:</span>
                      <span className="font-medium">{dateTime ? new Date(dateTime).toLocaleString() : 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Pickup:</span>
                      <span className="font-medium">{pickup || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{destination || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle:</span>
                      <span className="font-medium">{selectedVehicle || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Distance:</span>
                      <span className="font-medium">{directions ? (directions?.routes[0]?.legs[0]?.distance?.text) : 'N/A'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Duration:</span>
                      <span className="font-medium">{directions ? (directions?.routes[0]?.legs[0]?.duration?.text) : 'N/A'}</span>
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between text-lg">
                        <span className="font-medium">Estimated Fare:</span>
                        <span className="font-bold text-primary-600">₹{estimatedFare || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">Per Person:</span>
                        <span className="font-medium">₹{estimatedFarePerPerson || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Payment Method</h4>
                  <select className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                    <option>Credit Card (•••• 4242)</option>
                    <option>UPI</option>
                    <option>Cash</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the <a href="#" className="text-primary-600 hover:text-primary-500">Terms and Conditions</a>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          {step > 1 && (
            <motion.button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setStep(step - 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back
            </motion.button>
          )}

          <div className="flex-1"></div>

          {step < 3 ? (
            <motion.button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setStep(step + 1)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
              <FaArrowRight className="ml-2 h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBookRide}
              disabled={bookingLoading}
            >
              {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              <FaCheckCircle className="ml-2 h-4 w-4" />
            </motion.button>
          )}
        </div>

        {bookingError && <div className="text-red-600 mt-2 text-sm">{bookingError}</div>}
        {vehicleError && (
          <div className="text-red-600 font-medium mb-4">{vehicleError}</div>
        )}
      </div>

      {/* Optimization Modal */}
      {showOptimizationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full border-2 border-blue-200 animate-fade-in">
            <div className="flex items-center mb-4">
              <span className="text-2xl text-blue-600 mr-2">✨</span>
              <h3 className="text-xl font-bold text-blue-700">Optimization Complete!</h3>
            </div>
            <div className="mb-2 text-gray-700">Your route has been optimized by <span className="font-semibold text-blue-600">GreatAI</span> for group travel.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div>
                <div className="text-sm text-gray-700 font-medium mb-1">Original Route</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>Distance: <span className="font-semibold">{demoOptimization.originalRoute.distance} km</span></li>
                  <li>Time: <span className="font-semibold">{demoOptimization.originalRoute.time} hrs</span></li>
                  <li>Cost: <span className="font-semibold">₹{demoOptimization.originalRoute.cost}</span></li>
                  <li>Fuel: <span className="font-semibold">{demoOptimization.originalRoute.fuel} L</span></li>
                  <li>CO₂: <span className="font-semibold">{demoOptimization.originalRoute.co2} kg</span></li>
                </ul>
              </div>
              <div>
                <div className="text-sm text-green-700 font-medium mb-1">Optimized Route</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>Distance: <span className="font-semibold">{demoOptimization.optimizedRoute.distance} km</span> <span className="text-green-600">(↓{demoOptimization.originalRoute.distance - demoOptimization.optimizedRoute.distance} km)</span></li>
                  <li>Time: <span className="font-semibold">{demoOptimization.optimizedRoute.time} hrs</span> <span className="text-green-600">(↓{(demoOptimization.originalRoute.time - demoOptimization.optimizedRoute.time).toFixed(1)} hrs)</span></li>
                  <li>Cost: <span className="font-semibold">₹{demoOptimization.optimizedRoute.cost}</span> <span className="text-green-600">(↓₹{demoOptimization.originalRoute.cost - demoOptimization.optimizedRoute.cost})</span></li>
                  <li>Fuel: <span className="font-semibold">{demoOptimization.optimizedRoute.fuel} L</span> <span className="text-green-600">(↓{(demoOptimization.originalRoute.fuel - demoOptimization.optimizedRoute.fuel).toFixed(1)} L)</span></li>
                  <li>CO₂: <span className="font-semibold">{demoOptimization.optimizedRoute.co2} kg</span> <span className="text-green-600">(↓{(demoOptimization.originalRoute.co2 - demoOptimization.optimizedRoute.co2).toFixed(1)} kg)</span></li>
                </ul>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">* Powered by GreatAI for group travel optimization</div>
            <button
              className="mt-6 w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow"
              onClick={() => {
                setShowOptimizationModal(false);
                // Optionally navigate to ride details after closing
                // navigate(`/rides/123`);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong while booking a ride.</h2>;
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BookRide />
    </ErrorBoundary>
  );
}
