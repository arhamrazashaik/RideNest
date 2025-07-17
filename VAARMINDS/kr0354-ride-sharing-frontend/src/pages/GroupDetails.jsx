import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  MapPinIcon, 
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  ArrowRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Card, CardHeader, CardBody, CardFooter } from '../components/common/Card';
import Button from '../components/common/Button';

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    // In a real implementation, this would fetch group data from the API
    // For now, we'll use mock data
    const mockGroup = {
      _id: id,
      name: 'Tech Park Commuters',
      description: 'Daily office commute to Whitefield Tech Park. We share rides to save costs and reduce traffic congestion. Join us if you work in the Whitefield area!',
      type: 'office',
      creator: {
        _id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      members: [
        {
          user: {
            _id: '1',
            name: 'John Doe',
            profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          role: 'admin',
          joinedAt: '2023-01-15T10:30:00Z'
        },
        {
          user: {
            _id: '2',
            name: 'Alice Smith',
            profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
          },
          role: 'member',
          joinedAt: '2023-01-20T14:45:00Z'
        },
        {
          user: {
            _id: '3',
            name: 'Bob Johnson',
            profilePicture: 'https://randomuser.me/api/portraits/men/46.jpg'
          },
          role: 'member',
          joinedAt: '2023-02-05T09:15:00Z'
        },
        {
          user: {
            _id: '4',
            name: 'Emily Davis',
            profilePicture: 'https://randomuser.me/api/portraits/women/67.jpg'
          },
          role: 'member',
          joinedAt: '2023-02-10T11:30:00Z'
        }
      ],
      destination: {
        address: 'Whitefield Tech Park, Bangalore',
        coordinates: [77.7480, 12.9698]
      },
      origin: {
        address: 'Indiranagar, Bangalore',
        coordinates: [77.6410, 12.9784]
      },
      schedule: {
        startDate: '2023-01-15T00:00:00Z',
        endDate: null,
        recurring: {
          isRecurring: true,
          frequency: 'weekdays',
          days: [1, 2, 3, 4, 5],
          time: '09:00'
        }
      },
      rides: [
        {
          _id: 'r1',
          scheduledTime: '2023-04-10T09:00:00Z',
          status: 'completed'
        },
        {
          _id: 'r2',
          scheduledTime: '2023-04-11T09:00:00Z',
          status: 'completed'
        },
        {
          _id: 'r3',
          scheduledTime: '2023-04-12T09:00:00Z',
          status: 'completed'
        },
        {
          _id: 'r4',
          scheduledTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed'
        }
      ],
      chat: {
        messages: [
          {
            sender: {
              _id: '1',
              name: 'John Doe',
              profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
            },
            content: 'Good morning everyone! Ready for today\'s ride?',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            sender: {
              _id: '2',
              name: 'Alice Smith',
              profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
            },
            content: 'Yes, I\'ll be at the pickup point on time.',
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
          },
          {
            sender: {
              _id: '3',
              name: 'Bob Johnson',
              profilePicture: 'https://randomuser.me/api/portraits/men/46.jpg'
            },
            content: 'I might be 5 minutes late, traffic is heavy today.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      polls: [
        {
          _id: 'p1',
          title: 'Preferred pickup time',
          options: [
            { text: '8:30 AM', votes: 1 },
            { text: '9:00 AM', votes: 2 },
            { text: '9:30 AM', votes: 1 }
          ],
          isActive: false
        }
      ],
      settings: {
        fareCalculation: 'distance-based'
      },
      isPublic: true
    };
    
    setTimeout(() => {
      setGroup(mockGroup);
      setLoading(false);
    }, 1000);
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Group not found</h2>
        <p className="mt-2 text-gray-600">The group you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get upcoming rides
  const upcomingRides = group.rides.filter(ride => 
    new Date(ride.scheduledTime) > new Date() && 
    (ride.status === 'pending' || ride.status === 'confirmed')
  );
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
        <div className="flex space-x-2">
          <Button variant="outline" icon={PencilIcon}>
            Edit Group
          </Button>
          <Button>
            Book Group Ride
          </Button>
        </div>
      </div>
      
      {/* Group Type Badge */}
      <div className="mb-6">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          group.type === 'office' ? 'bg-blue-100 text-blue-800' :
          group.type === 'event' ? 'bg-purple-100 text-purple-800' :
          group.type === 'tour' ? 'bg-green-100 text-green-800' :
          'bg-orange-100 text-orange-800'
        }`}>
          {group.type.charAt(0).toUpperCase() + group.type.slice(1)} Group
        </span>
        {group.isPublic && (
          <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Public
          </span>
        )}
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'details'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Group Details
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'members'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('members')}
          >
            Members ({group.members.length})
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'rides'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('rides')}
          >
            Rides ({group.rides.length})
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'polls'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('polls')}
          >
            Polls
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 mb-6">{group.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Origin</h3>
                      <p className="text-sm text-gray-600">{group.origin.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Destination</h3>
                      <p className="text-sm text-gray-600">{group.destination.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Schedule</h3>
                      <p className="text-sm text-gray-600">
                        {group.schedule.recurring.isRecurring ? (
                          <>
                            Recurring: {group.schedule.recurring.frequency}
                            <br />
                            Time: {formatTime(group.schedule.recurring.time)}
                          </>
                        ) : (
                          'Non-recurring'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Created by</h3>
                      <p className="text-sm text-gray-600">{group.creator.name}</p>
                      <p className="text-sm text-gray-600">
                        Since {formatDate(group.schedule.startDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {upcomingRides.length > 0 && (
            <Card>
              <CardHeader className="bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Rides</h2>
              </CardHeader>
              <CardBody className="p-0">
                <div className="divide-y">
                  {upcomingRides.map((ride) => (
                    <div key={ride._id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {new Date(ride.scheduledTime).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(ride.scheduledTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <Link to={`/rides/${ride._id}`}>
                          <Button size="sm" variant="outline" icon={ArrowRightIcon} iconPosition="right">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
              <CardFooter className="bg-gray-50 text-right">
                <Link to="/rides" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all rides
                </Link>
              </CardFooter>
            </Card>
          )}
          
          <Card>
            <CardHeader className="bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Group Stats</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{group.rides.length}</div>
                  <div className="text-sm text-gray-600">Total Rides</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{group.members.length}</div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹12,450</div>
                  <div className="text-sm text-gray-600">Total Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">320 kg</div>
                  <div className="text-sm text-gray-600">CO₂ Reduced</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
      
      {activeTab === 'members' && (
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Members ({group.members.length})</h2>
              <Button size="sm" variant="outline" icon={PlusIcon}>
                Invite Member
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {group.members.map((member, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {member.user.profilePicture ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.user.profilePicture}
                          alt={member.user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-medium">
                            {member.user.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{member.user.name}</h3>
                      <div className="flex items-center">
                        <span className={`text-xs ${
                          member.role === 'admin' ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </span>
                        <span className="mx-1 text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          Joined {formatDate(member.joinedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
      
      {activeTab === 'rides' && (
        <Card>
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Rides</h2>
              <Button icon={ChartBarIcon}>
                Ride Statistics
              </Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {group.rides.map((ride) => (
                <div key={ride._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {new Date(ride.scheduledTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </h3>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600 mr-2">
                          {new Date(ride.scheduledTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                          ride.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          ride.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                        </span>
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
          </CardBody>
        </Card>
      )}
      
      {activeTab === 'chat' && (
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Group Chat</h2>
              <div className="text-sm text-gray-500">
                {group.members.length} members
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0 flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {group.chat.messages.map((message, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    {message.sender.profilePicture ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={message.sender.profilePicture}
                        alt={message.sender.name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-medium">
                          {message.sender.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-900">{message.sender.name}</h3>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
          <div className="border-t p-4">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="input flex-1 mr-2"
              />
              <Button icon={ChatBubbleLeftRightIcon}>
                Send
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {activeTab === 'polls' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Polls</h2>
                <Button size="sm" variant="outline" icon={PlusIcon}>
                  Create Poll
                </Button>
              </div>
            </CardHeader>
            <CardBody>
              {group.polls.length > 0 ? (
                <div className="space-y-6">
                  {group.polls.map((poll) => (
                    <div key={poll._id} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{poll.title}</h3>
                      <div className="space-y-3 mb-4">
                        {poll.options.map((option, index) => {
                          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                          
                          return (
                            <div key={index}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm text-gray-700">{option.text}</span>
                                <span className="text-sm text-gray-500">{option.votes} votes ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${poll.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {poll.isActive ? 'Active' : 'Closed'}
                        </span>
                        {poll.isActive && (
                          <Button size="sm">
                            Vote
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No polls have been created yet</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;
