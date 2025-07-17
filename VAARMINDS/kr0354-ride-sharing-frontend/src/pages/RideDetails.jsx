import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon, 
  TruckIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import axios from 'axios';
import { auth } from '../firebase';
import AuthContext from '../context/AuthContext';
import { io } from 'socket.io-client';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { socket } from '../context/AuthContext';

const RideDetails = () => {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  
  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        setError(null);
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          setError('You must be logged in to view this ride.');
          setLoading(false);
          return;
        }
        const token = await firebaseUser.getIdToken();
        const res = await axios.get(`http://localhost:5000/api/rides/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRide(res.data);
      } catch (err) {
        setError('Ride not found or you are not authorized to view this ride.');
        setRide(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, [id]);
  
  useEffect(() => {
    if (ride) {
      socket.emit('join-ride', ride._id);
      socket.on('vehicle-location-update', (loc) => {
        setVehicleLocation({ lat: loc.lat, lng: loc.lng });
      });
      return () => {
        socket.off('vehicle-location-update');
      };
    }
  }, [ride]);
  
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
  
  if (!ride) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Ride not found</h2>
        <p className="mt-2 text-gray-600">The ride you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const mapContainerStyle = { width: '100%', height: '100%' };
  const defaultCenter = { lat: 18.4386, lng: 79.1288 };
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {ride.type.charAt(0).toUpperCase() + ride.type.slice(1)} Ride
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline">Cancel Ride</Button>
          <Button>Track Ride</Button>
        </div>
      </div>
      
      {/* Status Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          ride.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          ride.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          ride.status === 'completed' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
        </span>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Ride Details
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'passengers'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('passengers')}
          >
            Passengers
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('map')}
          >
            Map & Route
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Ride Information</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Scheduled Time</h3>
                    <p className="text-sm text-gray-600">{formatDate(ride.scheduledTime)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Pickup Location</h3>
                    <p className="text-sm text-gray-600">{ride.passengers[0].pickupLocation.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Destination</h3>
                    <p className="text-sm text-gray-600">{ride.passengers[0].dropoffLocation.address}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Fare</h3>
                    <p className="text-sm text-gray-600">₹{ride.totalFare} ({ride.passengers.length} passengers)</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Vehicle & Driver</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-start">
                  <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Vehicle</h3>
                    <p className="text-sm text-gray-600">
                      {ride.vehicle.make} {ride.vehicle.model} ({ride.vehicle.color})
                    </p>
                    <p className="text-sm text-gray-600">
                      License Plate: {ride.vehicle.licensePlate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Driver</h3>
                    <p className="text-sm text-gray-600">{ride.driver.name}</p>
                    <p className="text-sm text-gray-600">{ride.driver.phoneNumber}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-sm font-medium text-yellow-500">{ride.driver.ratings.average}</span>
                      <div className="ml-1 flex">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(ride.driver.ratings.average)
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 15.934l-6.18 3.254 1.18-6.875L.001 7.466l6.902-1.001L10 0l3.097 6.465 6.902 1.001-4.999 4.847 1.18 6.875z"
                            />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">
                        ({ride.driver.ratings.count} ratings)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <Button size="sm" variant="outline">
                      Contact Driver
                    </Button>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      
      {activeTab === 'passengers' && (
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Passengers ({ride.passengers.length})</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {/* Show current user's details at the top if present */}
              {ride.passengers.filter(p => p.user._id === user?._id).map((passenger, index) => (
                <div key={passenger.user._id} className="p-4 bg-primary-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {passenger.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{passenger.user.name} (You)</h3>
                        <p className="text-xs text-gray-500">{passenger.user.phoneNumber}</p>
                        <div className="mt-1 flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">Pickup: {passenger.pickupLocation.address}</p>
                        </div>
                        <div className="mt-1 flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">Dropoff: {passenger.dropoffLocation.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{passenger.fare.total}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        passenger.fare.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {passenger.fare.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {/* Show other passengers */}
              {ride.passengers.filter(p => p.user._id !== user?._id).map((passenger, index) => (
                <div key={passenger.user._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {passenger.user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">{passenger.user.name}</h3>
                        <p className="text-xs text-gray-500">{passenger.user.phoneNumber}</p>
                        <div className="mt-1 flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">Pickup: {passenger.pickupLocation.address}</p>
                        </div>
                        <div className="mt-1 flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <p className="text-xs text-gray-500 truncate">Dropoff: {passenger.dropoffLocation.address}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">₹{passenger.fare.total}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        passenger.fare.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {passenger.fare.paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      
      {activeTab === 'map' && (
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Route Map</h2>
          </CardHeader>
          <CardBody>
            <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center relative">
              <LiveMap
                pickup={ride.passengers[0]?.pickupLocation}
                dropoff={ride.passengers[0]?.dropoffLocation}
                vehicleLocation={vehicleLocation}
              />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Distance:</span>
                <span className="text-sm font-medium text-gray-900">{ride.route.totalDistance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Duration:</span>
                <span className="text-sm font-medium text-gray-900">{ride.route.totalDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Route Optimization:</span>
                <span className="text-sm font-medium text-gray-900">{ride.route.optimized ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

function LiveMap({ pickup, dropoff, vehicleLocation }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
  });
  const [directions, setDirections] = useState(null);
  useEffect(() => {
    if (isLoaded && pickup && dropoff) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: pickup.coordinates,
          destination: dropoff.coordinates,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') setDirections(result);
        }
      );
    }
  }, [isLoaded, pickup, dropoff]);
  if (!isLoaded) return <div>Loading map...</div>;
  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={vehicleLocation || pickup?.coordinates || defaultCenter}
      zoom={vehicleLocation ? 15 : 13}
    >
      {pickup && <Marker position={pickup.coordinates} label="P" />}
      {dropoff && <Marker position={dropoff.coordinates} label="D" />}
      {vehicleLocation && <Marker position={vehicleLocation} label="V" icon={{ url: 'https://maps.google.com/mapfiles/ms/icons/bus.png' }} />}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
}

export default RideDetails;
