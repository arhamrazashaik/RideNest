import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../firebase';
import AuthContext from '../context/AuthContext';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import { socket } from '../context/AuthContext';

const DriverDashboard = () => {
  const { user } = useContext(AuthContext);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(''); // rideId for which action is loading

  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError('');
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setError('You must be logged in as a driver to view your rides.');
          setLoading(false);
          return;
        }
        const token = await firebaseUser.getIdToken();
        // Fetch all rides where user is the driver
        const res = await axios.get('http://localhost:5000/api/rides', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter rides where user is the driver
        const driverRides = res.data.filter(ride => ride.driver && ride.driver._id === user._id);
        setRides(driverRides);
      } catch (err) {
        setError('Failed to fetch rides.');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();

    // Listen for real-time new ride requests
    socket.on('new-ride', (ride) => {
      setRides(rides => [ride, ...rides]);
    });

    // Automatic live location sharing for active rides
    let locationInterval;
    const activeRide = rides.find(r => r.status === 'confirmed' || r.status === 'in-progress');
    if (activeRide) {
      if (navigator.geolocation) {
        locationInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              socket.emit('vehicle-location', {
                rideId: activeRide._id,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => {},
            { enableHighAccuracy: true }
          );
        }, 5000); // every 5 seconds
      }
    }
    return () => {
      if (locationInterval) clearInterval(locationInterval);
      socket.off('new-ride');
    };
  }, [user, rides]);

  const handleAction = async (rideId, action) => {
    setActionLoading(rideId + action);
    try {
      const firebaseUser = auth.currentUser;
      const token = await firebaseUser.getIdToken();
      await axios.put(`http://localhost:5000/api/rides/${rideId}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh rides
      setRides(rides => rides.map(r => r._id === rideId ? { ...r, status: action === 'accept' ? 'confirmed' : 'rejected' } : r));
    } catch (err) {
      alert('Failed to update ride status.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Error</h2>
        <p className="mt-2 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Driver Dashboard</h1>
      {rides.length === 0 ? (
        <div className="text-center text-gray-500">No rides assigned to you yet.</div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => (
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
                {ride.status === 'pending' && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={actionLoading === ride._id + 'accept'}
                      onClick={() => handleAction(ride._id, 'accept')}
                    >
                      {actionLoading === ride._id + 'accept' ? 'Accepting...' : 'Accept'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={actionLoading === ride._id + 'reject'}
                      onClick={() => handleAction(ride._id, 'reject')}
                    >
                      {actionLoading === ride._id + 'reject' ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard; 