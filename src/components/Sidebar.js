import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Key,
  Terminal,
  Zap,
  Settings,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      name: 'Dashboard',
      icon: Home,
      description: 'Overview of all configurations'
    },
    {
      path: '/api-key',
      name: 'API Key',
      icon: Key,
      description: 'Manage GLM API credentials'
    },
    {
      path: '/claude-code',
      name: 'Claude Code',
      icon: Terminal,
      description: 'Configure Claude Code integration'
    },
    {
      path: '/crush',
      name: 'Crush',
      icon: Zap,
      description: 'Setup Crush configuration'
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: Settings,
      description: 'Application preferences'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">GLM AI Config</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Configuration Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group flex items-center justify-between p-3 rounded-lg transition-all duration-200
                ${active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                <div>
                  <div className={`font-medium ${
                    active ? 'text-primary-700 dark:text-primary-300' : ''
                  }`}>
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </div>

              {active && (
                <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          <div>GLM AI Configuration Tool</div>
          <div className="mt-1">Version 1.0.0</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;