import React from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import {
  Key,
  Terminal,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Activity
} from 'lucide-react';

const Dashboard = () => {
  const { configurations, loading, getOverallStatus } = useConfig();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const status = getOverallStatus();

  const platforms = [
    {
      name: 'Claude Code',
      path: '/claude-code',
      icon: Terminal,
      config: configurations.claudeCode,
      description: 'Terminal AI coding assistant'
    },
    {
      name: 'Crush',
      path: '/crush',
      icon: Zap,
      config: configurations.crush,
      description: 'CLI + TUI coding agent'
    },
  ];

  const getStatusIcon = (configured) => {
    if (configured) {
      return <CheckCircle className="w-5 h-5 text-success-500" />;
    }
    return <XCircle className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (configured) => {
    return configured
      ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your GLM AI configuration status across all platforms
        </p>
      </div>

      {/* Overall Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Configuration Status
          </h2>
          <Activity className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* API Key Status */}
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              status.apiKeyConfigured
                ? 'bg-success-100 dark:bg-success-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Key className={`w-8 h-8 ${
                status.apiKeyConfigured
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-gray-400'
              }`} />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">API Key</h3>
            <p className={`text-sm ${
              status.apiKeyConfigured
                ? 'text-success-600 dark:text-success-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {status.apiKeyConfigured ? 'Configured' : 'Not Set'}
            </p>
          </div>

          {/* Platforms Status */}
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              status.platformsConfigured > 0
                ? 'bg-primary-100 dark:bg-primary-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <span className={`text-2xl font-bold ${
                status.platformsConfigured > 0
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400'
              }`}>
                {status.platformsConfigured}
              </span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Platforms</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status.platformsConfigured} of {status.totalPlatforms} configured
            </p>
          </div>

          {/* Overall Status */}
          <div className="text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
              status.allConfigured
                ? 'bg-success-100 dark:bg-success-900/30'
                : status.partiallyConfigured
                ? 'bg-warning-100 dark:bg-warning-900/30'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              {status.allConfigured ? (
                <CheckCircle className="w-8 h-8 text-success-600 dark:text-success-400" />
              ) : status.partiallyConfigured ? (
                <AlertTriangle className="w-8 h-8 text-warning-600 dark:text-warning-400" />
              ) : (
                <XCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">Status</h3>
            <p className={`text-sm ${
              status.allConfigured
                ? 'text-success-600 dark:text-success-400'
                : status.partiallyConfigured
                ? 'text-warning-600 dark:text-warning-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {status.allConfigured
                ? 'Complete'
                : status.partiallyConfigured
                ? 'Partial'
                : 'Not Started'
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        {!status.apiKeyConfigured && (
          <div className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                  API Key Required
                </h4>
                <p className="text-sm text-warning-600 dark:text-warning-300 mt-1">
                  You need to configure your GLM API key before setting up platforms.
                </p>
              </div>
              <Link
                to="/api-key"
                className="bg-warning-600 hover:bg-warning-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <span>Set API Key</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;

          return (
            <Link
              key={platform.name}
              to={platform.path}
              className={`
                block p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md
                ${getStatusColor(platform.config.configured)}
                hover:border-primary-300 dark:hover:border-primary-600
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    platform.config.configured
                      ? 'bg-success-100 dark:bg-success-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      platform.config.configured
                        ? 'text-success-600 dark:text-success-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {platform.name}
                  </h3>
                </div>
                {getStatusIcon(platform.config.configured)}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {platform.description}
              </p>

              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  platform.config.configured
                    ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {platform.config.configured ? 'Configured' : 'Not Configured'}
                </span>

                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>

              {platform.config.lastUpdated && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Last updated: {new Date(platform.config.lastUpdated).toLocaleString()}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;