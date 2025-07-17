import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CreditCardIcon,
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import AlertContext from '../context/AlertContext';
import { Card, CardHeader, CardBody, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';
import { auth } from '../firebase';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [previousRides, setPreviousRides] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
          addAlert('You must be logged in to view the dashboard.', 'error');
          setIsLoading(false);
          return;
        }
        const token = await firebaseUser.getIdToken();

        // Fetch upcoming rides
        const ridesRes = await axios.get('http://localhost:5000/api/rides', {
          params: {
            status: 'pending,confirmed',
            from: new Date().toISOString()
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch previous rides (completed)
        const prevRidesRes = await axios.get('http://localhost:5000/api/rides', {
          params: {
            status: 'completed',
            to: new Date().toISOString()
          },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Fetch user's groups
        const groupsRes = await axios.get('http://localhost:5000/api/groups', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // In a real app, we would fetch recent activity from the backend
        // For now, we'll use mock data
        const mockActivity = [
          {
            id: 1,
            type: 'ride_completed',
            message: 'Your ride to Office was completed',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: 'payment_success',
            message: 'Payment of ₹350 was successful',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'group_joined',
            message: 'You joined "Tech Park Commuters" group',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        setUpcomingRides(ridesRes.data.slice(0, 3));
        setPreviousRides(prevRidesRes.data.slice(0, 3));
        setMyGroups(groupsRes.data.slice(0, 3));
        setRecentActivity(mockActivity);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addAlert('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [addAlert]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format relative time
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-primary-100">
          Here's what's happening with your rides and groups.
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'Book a Ride',
            icon: MapPinIcon,
            color: 'bg-blue-500',
            link: '/book-ride'
          },
          {
            title: 'My Rides',
            icon: CalendarIcon,
            color: 'bg-green-500',
            link: '/rides'
          },
          {
            title: 'My Groups',
            icon: UserGroupIcon,
            color: 'bg-purple-500',
            link: '/groups'
          },
          {
            title: 'Payments',
            icon: CreditCardIcon,
            color: 'bg-orange-500',
            link: '/payments'
          }
        ].map((action, index) => (
          <Link key={index} to={action.link}>
            <Card hover className="h-full">
              <CardBody className="flex items-center p-4">
                <div className={`${action.color} p-3 rounded-full mr-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Rides */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Rides</h2>
          </CardHeader>
          <CardBody className="p-0">
            {upcomingRides.length > 0 ? (
              <div className="divide-y">
                {upcomingRides.map((ride) => (
                  <div key={ride._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {ride.type.charAt(0).toUpperCase() + ride.type.slice(1)} Ride
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(ride.scheduledTime)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {ride.passengers[0]?.dropoffLocation?.address || 'Destination'}
                        </div>
                      </div>
                      <Link to={`/rides/${ride._id}`}>
                        <Button size="sm" variant="outline" icon={ArrowRightIcon} iconPosition="right">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No upcoming rides</p>
                <Link to="/book-ride" className="mt-4 inline-block">
                  <Button size="sm">Book a Ride</Button>
                </Link>
              </div>
            )}
          </CardBody>
          {upcomingRides.length > 0 && (
            <CardFooter className="bg-gray-50 text-right">
              <Link to="/rides" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all rides
              </Link>
            </CardFooter>
          )}
        </Card>
        
        {/* Previous Rides */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Previous Rides</h2>
          </CardHeader>
          <CardBody className="p-0">
            {previousRides.length > 0 ? (
              <div className="divide-y">
                {previousRides.map((ride) => (
                  <div key={ride._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {ride.type ? `${ride.type.charAt(0).toUpperCase() + ride.type.slice(1)} Ride` : 'Ride'}
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDate(ride.scheduledTime)}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {ride.passengers[0]?.dropoffLocation?.address || 'Destination'}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="font-semibold">Vehicle:</span>&nbsp;
                          {ride.vehicle?.type ? ride.vehicle.type.charAt(0).toUpperCase() + ride.vehicle.type.slice(1) : 'N/A'}
                        </div>
                      </div>
                      <Link to={`/rides/${ride._id}`}>
                        <Button size="sm" variant="outline" icon={ArrowRightIcon} iconPosition="right">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">No previous rides</p>
              </div>
            )}
          </CardBody>
          {previousRides.length > 0 && (
            <CardFooter className="bg-gray-50 text-right">
              <Link to="/rides" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all rides
              </Link>
            </CardFooter>
          )}
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {getRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        
        {/* My Groups */}
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">My Groups</h2>
          </CardHeader>
          <CardBody className="p-0">
            {myGroups.length > 0 ? (
              <div className="divide-y">
                {myGroups.map((group) => (
                  <div key={group._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{group.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Group • {group.members.length} members
                        </p>
                      </div>
                      <Link to={`/groups/${group._id}`}>
                        <Button size="sm" variant="outline" icon={ArrowRightIcon} iconPosition="right">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">You haven't joined any groups yet</p>
                <Link to="/groups" className="mt-4 inline-block">
                  <Button size="sm">Find Groups</Button>
                </Link>
              </div>
            )}
          </CardBody>
          {myGroups.length > 0 && (
            <CardFooter className="bg-gray-50 text-right">
              <Link to="/groups" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View all groups
              </Link>
            </CardFooter>
          )}
        </Card>
        
        {/* Quick Stats */}
        <Card>
          <CardHeader className="bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Stats</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Distance Traveled</p>
                <p className="text-2xl font-bold text-gray-900">243 km</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Money Saved</p>
                <p className="text-2xl font-bold text-green-600">₹1,850</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">CO₂ Reduced</p>
                <p className="text-2xl font-bold text-green-600">45 kg</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
