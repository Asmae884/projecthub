import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  FolderIcon, 
  UserIcon, 
  LogoutIcon 
} from '@heroicons/react/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-blue-600">
            ProjectHub
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              <HomeIcon className="h-6 w-6" />
            </Link>
            <Link to="/projects" className="text-gray-700 hover:text-blue-600">
              <FolderIcon className="h-6 w-6" />
            </Link>
            <span className="text-gray-700">
              <UserIcon className="h-6 w-6 inline-block mr-1" />
              {user?.name}
            </span>
            <button type="button"
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600"
            >
              <LogoutIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;