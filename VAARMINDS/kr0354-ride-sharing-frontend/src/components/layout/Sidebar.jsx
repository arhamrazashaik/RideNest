import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  HomeIcon,
  UserIcon,
  UsersIcon,
  CalendarIcon,
  MapIcon,
  CreditCardIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      icon: HomeIcon,
      path: '/',
      public: true
    },
    {
      name: 'Dashboard',
      icon: ChartBarIcon,
      path: '/dashboard',
      public: false
    },
    {
      name: 'Book a Ride',
      icon: MapIcon,
      path: '/book-ride',
      public: false
    },
    {
      name: 'My Groups',
      icon: UsersIcon,
      path: '/groups',
      public: false
    },
    {
      name: 'My Rides',
      icon: CalendarIcon,
      path: '/rides',
      public: false
    },
    {
      name: 'Payments',
      icon: CreditCardIcon,
      path: '/payments',
      public: false
    },
    {
      name: 'Profile',
      icon: UserIcon,
      path: '/profile',
      public: false
    },
    {
      name: 'Settings',
      icon: Cog6ToothIcon,
      path: '/settings',
      public: false
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">KR0354</span>
            </Link>
            <button
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={toggleSidebar}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                (item.public || isAuthenticated) && (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 text-sm ${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                )
              ))}
            </ul>
          </nav>

          {isAuthenticated && (
            <div className="p-4 border-t">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {user?.profilePicture ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.profilePicture}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-700 font-medium">
                        {user?.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
