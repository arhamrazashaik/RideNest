import React from 'react';
import { FaMapMarkedAlt } from 'react-icons/fa';

const hardcodedRides = [
  {
    id: 1,
    driver: 'Amit Sharma',
    contact: '+91 9876543210',
    source: 'MG Road, Bangalore',
    destination: 'Electronic City, Bangalore',
    time: '8:30 AM, 5 July 2025',
    passengers: 2,
    capacity: 4,
  },
  {
    id: 2,
    driver: 'Priya Verma',
    contact: '+91 9123456780',
    source: 'Indiranagar, Bangalore',
    destination: 'Whitefield, Bangalore',
    time: '9:00 AM, 5 July 2025',
    passengers: 3,
    capacity: 6,
  },
  {
    id: 3,
    driver: 'Rahul Singh',
    contact: '+91 9988776655',
    source: 'Koramangala, Bangalore',
    destination: 'HSR Layout, Bangalore',
    time: '7:45 AM, 5 July 2025',
    passengers: 1,
    capacity: 4,
  },
];

const openGoogleMapsRoute = (source, destination) => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
  window.open(url, '_blank');
};

const JoinRide = () => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Available Rides</h1>
      <div className="space-y-4">
        {hardcodedRides.map((ride) => (
          <div key={ride.id} className="border rounded-lg p-4 shadow-sm bg-white">
            <div className="flex justify-between items-center mb-2">
              <div className="font-semibold text-lg">{ride.source} → {ride.destination}</div>
              <div className="flex flex-col items-center ml-4">
                <button
                  title="View Route on Map"
                  onClick={() => openGoogleMapsRoute(ride.source, ride.destination)}
                  className="text-primary-600 hover:text-primary-800 focus:outline-none"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <FaMapMarkedAlt className="text-2xl mb-1" />
                </button>
                <span className="text-xs text-primary-700 font-medium">View route</span>
              </div>
            </div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Driver:</span> {ride.driver}
            </div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Contact:</span> {ride.contact}
            </div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Time:</span> {ride.time}
            </div>
            <div className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Passengers:</span> {ride.passengers} / {ride.capacity} &nbsp;|&nbsp; <span className="font-medium">Remaining Seats:</span> {ride.capacity - ride.passengers}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JoinRide; 