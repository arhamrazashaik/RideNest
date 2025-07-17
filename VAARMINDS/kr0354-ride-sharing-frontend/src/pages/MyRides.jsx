import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import AuthContext from '../context/AuthContext';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import { socket } from '../context/AuthContext';

// StarRating component for local rating
function StarRating({ value, onChange }) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={
            star <= value
              ? 'text-yellow-400 text-xl focus:outline-none'
              : 'text-gray-300 text-xl focus:outline-none'
          }
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Hardcoded demo rides (move outside component to keep times fixed)
const demoRides = [
  {
    _id: 'demo1',
    type: 'custom',
    status: 'completed',
    scheduledTime: new Date(Date.now() - 86400000).toISOString(),
    passengers: [
      {
        pickupLocation: { address: '10-1-622/A, Amrutha Nilayam, Karimnagar' },
        dropoffLocation: { address: '456 Office Park, Bangalore' },
      },
    ],
    vehicle: { type: 'Sedan' },
    totalFare: 320,
    // Hardcoded optimization info
    originalRoute: {
      distance: 520, // km
      time: 9.5, // hours
      cost: 400,
      fuel: 38, // liters
      co2: 90, // kg
    },
    optimizedRoute: {
      distance: 480, // km
      time: 8.2, // hours
      cost: 320,
      fuel: 30, // liters
      co2: 70, // kg
    },
  },
  {
    _id: 'demo2',
    type: 'pool',
    status: 'ongoing',
    scheduledTime: new Date(Date.now() + 3600000).toISOString(),
    passengers: [
      {
        pickupLocation: { address: 'MG Road, Bangalore' },
        dropoffLocation: { address: 'Electronic City, Bangalore' },
      },
    ],
    vehicle: { type: 'SUV' },
    totalFare: 450,
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
  },
  {
    _id: 'demo3',
    type: 'shemode',
    status: 'upcoming',
    scheduledTime: new Date(Date.now() + 7200000).toISOString(),
    passengers: [
      {
        pickupLocation: { address: 'Indiranagar, Bangalore' },
        dropoffLocation: { address: 'Whitefield, Bangalore' },
      },
    ],
    vehicle: { type: 'Van' },
    totalFare: 600,
    originalRoute: {
      distance: 18,
      time: 0.7,
      cost: 250,
      fuel: 2.1,
      co2: 5,
    },
    optimizedRoute: {
      distance: 14,
      time: 0.5,
      cost: 180,
      fuel: 1.5,
      co2: 3.5,
    },
  },
];

const MyRides = () => {
  const { user } = useContext(AuthContext);
  // Add local state for ratings
  const [ratings, setRatings] = useState({});

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Rides</h1>
      {demoRides.length === 0 ? (
        <div className="text-center text-gray-500">You have not booked any rides yet.</div>
      ) : (
        <div className="space-y-4">
          {demoRides.map((ride) => (
            <Card key={ride._id}>
              <CardHeader className="bg-gray-50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{ride.type ? ride.type.charAt(0).toUpperCase() + ride.type.slice(1) : 'Ride'}</h2>
                  <div className="text-sm text-gray-500">{ride.status ? ride.status.charAt(0).toUpperCase() + ride.status.slice(1) : ''}</div>
                </div>
                <Link to={`/rides/${ride._id}`}>
                  <Button size="sm" variant="outline">Details</Button>
                </Link>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600"><span className="font-medium">Date & Time:</span> {ride.scheduledTime ? new Date(ride.scheduledTime).toLocaleString() : 'N/A'}</div>
                    <div className="text-sm text-gray-600"><span className="font-medium">Pickup:</span> {ride.passengers[0]?.pickupLocation?.address || 'N/A'}</div>
                    <div className="text-sm text-gray-600"><span className="font-medium">Destination:</span> {ride.passengers[0]?.dropoffLocation?.address || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600"><span className="font-medium">Vehicle:</span> {ride.vehicle?.type || 'N/A'}</div>
                    <div className="text-sm text-gray-600"><span className="font-medium">Fare:</span> ₹{ride.totalFare || 'N/A'}</div>
                  </div>
                </div>
                {/* Star rating for each ride */}
                <div className="mt-4 flex items-center">
                  <span className="mr-2 text-sm text-gray-700">Your Rating:</span>
                  <StarRating
                    value={ratings[ride._id] || 0}
                    onChange={(val) => setRatings((prev) => ({ ...prev, [ride._id]: val }))}
                  />
                  {ratings[ride._id] && (
                    <span className="ml-2 text-green-600 text-sm">{ratings[ride._id]} / 5</span>
                  )}
                </div>
                {/* Optimization info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-inner">
                  <h4 className="font-semibold text-blue-700 mb-2">Route Optimization by GreatAI</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-700 font-medium mb-1">Original Route</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>Distance: <span className="font-semibold">{ride.originalRoute.distance} km</span></li>
                        <li>Time: <span className="font-semibold">{ride.originalRoute.time} hrs</span></li>
                        <li>Cost: <span className="font-semibold">₹{ride.originalRoute.cost}</span></li>
                        <li>Fuel: <span className="font-semibold">{ride.originalRoute.fuel} L</span></li>
                        <li>CO₂: <span className="font-semibold">{ride.originalRoute.co2} kg</span></li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm text-green-700 font-medium mb-1">Optimized Route</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>Distance: <span className="font-semibold">{ride.optimizedRoute.distance} km</span> <span className="text-green-600">(↓{ride.originalRoute.distance - ride.optimizedRoute.distance} km)</span></li>
                        <li>Time: <span className="font-semibold">{ride.optimizedRoute.time} hrs</span> <span className="text-green-600">(↓{(ride.originalRoute.time - ride.optimizedRoute.time).toFixed(1)} hrs)</span></li>
                        <li>Cost: <span className="font-semibold">₹{ride.optimizedRoute.cost}</span> <span className="text-green-600">(↓₹{ride.originalRoute.cost - ride.optimizedRoute.cost})</span></li>
                        <li>Fuel: <span className="font-semibold">{ride.optimizedRoute.fuel} L</span> <span className="text-green-600">(↓{(ride.originalRoute.fuel - ride.optimizedRoute.fuel).toFixed(1)} L)</span></li>
                        <li>CO₂: <span className="font-semibold">{ride.optimizedRoute.co2} kg</span> <span className="text-green-600">(↓{(ride.originalRoute.co2 - ride.optimizedRoute.co2).toFixed(1)} kg)</span></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 italic">* Powered by GreatAI for group travel optimization</div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides; 