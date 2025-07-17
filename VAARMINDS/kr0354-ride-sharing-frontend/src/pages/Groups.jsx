import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserGroupIcon, 
  MapPinIcon, 
  CalendarIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Card, CardBody } from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    // In a real implementation, this would fetch groups from the API
    // For now, we'll use mock data
    const mockGroups = [
      {
        _id: '1',
        name: 'Tech Park Commuters',
        description: 'Daily office commute to Whitefield Tech Park',
        type: 'office',
        members: new Array(12).fill(null),
        destination: {
          address: 'Whitefield Tech Park, Bangalore'
        },
        schedule: {
          recurring: {
            isRecurring: true,
            frequency: 'weekdays'
          }
        },
        isPublic: true
      },
      {
        _id: '2',
        name: 'Weekend Getaway Group',
        description: 'Group for weekend trips to nearby destinations',
        type: 'tour',
        members: new Array(8).fill(null),
        destination: {
          address: 'Various locations'
        },
        schedule: {
          recurring: {
            isRecurring: false
          }
        },
        isPublic: true
      },
      {
        _id: '3',
        name: 'Concert Goers',
        description: 'Group for attending concerts and music events',
        type: 'event',
        members: new Array(15).fill(null),
        destination: {
          address: 'Various event venues'
        },
        schedule: {
          recurring: {
            isRecurring: false
          }
        },
        isPublic: true
      },
      {
        _id: '4',
        name: 'Airport Travelers',
        description: 'Share rides to and from the airport',
        type: 'custom',
        members: new Array(6).fill(null),
        destination: {
          address: 'Kempegowda International Airport'
        },
        schedule: {
          recurring: {
            isRecurring: false
          }
        },
        isPublic: true
      }
    ];
    
    setTimeout(() => {
      setGroups(mockGroups);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter and search groups
  const filteredGroups = groups.filter(group => {
    const matchesFilter = filter === 'all' || group.type === filter;
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
        <Link to="/groups/create">
          <Button icon={PlusIcon}>
            Create Group
          </Button>
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-2/3">
          <Input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={MagnifyingGlassIcon}
          />
        </div>
        <div className="md:w-1/3">
          <select
            className="input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="office">Office</option>
            <option value="event">Event</option>
            <option value="tour">Tour</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
      
      {/* Groups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => (
            <Link key={group._id} to={`/groups/${group._id}`}>
              <Card hover className="h-full hover-3d">
                <CardBody>
                  <div className="flex items-start mb-4">
                    <div className={`p-3 rounded-lg mr-4 ${
                      group.type === 'office' ? 'bg-blue-100 text-blue-600' :
                      group.type === 'event' ? 'bg-purple-100 text-purple-600' :
                      group.type === 'tour' ? 'bg-green-100 text-green-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <UserGroupIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 capitalize">
                        {group.type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {group.members.length} members
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {group.destination.address}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {group.schedule.recurring.isRecurring 
                        ? `Recurring (${group.schedule.recurring.frequency})` 
                        : 'Non-recurring'}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No groups found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
      
      {/* Discover Public Groups */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Discover Public Groups</h2>
        
        <Card>
          <CardBody className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find groups near you</h3>
            <p className="text-gray-600 mb-6">
              Discover public groups in your area and join them to share rides and save money.
            </p>
            <Button>
              Explore Public Groups
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Groups;
