import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { Menu, Transition } from '@headlessui/react';
import { LogOut, User } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-secondary-200 shadow-sm">
      <div className="container-center">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-secondary-900">Chakshu</h1>
              <p className="text-xs text-secondary-600">Smart Interviews, Better Hires</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/jobs')}
              className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
            >
              Browse Jobs
            </button>
            {isAuthenticated && user?.role === 'employer' && (
              <>
                <button
                  onClick={() => navigate('/employer/dashboard')}
                  className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/employer/jobs/create')}
                  className="text-secondary-700 hover:text-primary-600 transition-colors font-medium"
                >
                  Create Job
                </button>
              </>
            )}
          </div>

          {/* Right Side - Auth or User Menu */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            ) : (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 transition-colors">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="hidden sm:inline text-sm font-semibold text-secondary-900">
                    {user?.full_name || user?.email}
                  </span>
                </Menu.Button>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-secondary-200">
                      <p className="text-sm font-semibold text-secondary-900">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-secondary-600">{user?.email}</p>
                      <p className="text-xs text-primary-600 mt-1 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center ${
                            active ? 'bg-secondary-100' : ''
                          } hover:bg-secondary-100 transition-colors text-danger-600`}
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
