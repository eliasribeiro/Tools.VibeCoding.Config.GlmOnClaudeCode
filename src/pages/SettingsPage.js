import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useNotification } from '../contexts/NotificationContext';
import { isElectron, isDevelopment } from '../utils/electronCheck';
import {
  Settings,
  Moon,
  Sun,
  RefreshCw,
  Trash2,
  Download,
  Info,
  AlertTriangle,
  CheckCircle,
  Monitor
} from 'lucide-react';

const SettingsPage = ({ isDarkMode, toggleDarkMode }) => {
  const { loadConfigurationStatus, configurations } = useConfig();
  const { showSuccess, showError, showInfo, clearAllNotifications } = useNotification();

  const [loading, setLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    electronVersion: 'Unknown',
    nodeVersion: 'Unknown',
    chromeVersion: 'Unknown'
  });

  useEffect(() => {
    // Get system information when component mounts
    getSystemInformation();
  }, []);

  const getSystemInformation = async () => {
    try {
      if (isElectron()) {
        const result = await window.electronAPI.getSystemInfo();
        if (result.success && result.info.versions) {
          // In Electron, get versions from main process
          setSystemInfo({
            electronVersion: result.info.versions.electron || 'Unknown',
            nodeVersion: result.info.versions.node || 'Unknown',
            chromeVersion: result.info.versions.chrome || 'Unknown'
          });
        } else {
          // Fallback for Electron
          setSystemInfo({
            electronVersion: 'Electron App',
            nodeVersion: 'Node.js',
            chromeVersion: 'Chromium'
          });
        }
      } else if (isDevelopment()) {
        // In browser development mode
        setSystemInfo({
          electronVersion: 'Development Mode',
          nodeVersion: 'Development Mode',
          chromeVersion: navigator.userAgent.includes('Chrome') ? 'Chrome Browser' : 'Browser'
        });
      } else {
        // Fallback values
        setSystemInfo({
          electronVersion: 'Unknown',
          nodeVersion: 'Unknown',
          chromeVersion: 'Unknown'
        });
      }
    } catch (error) {
      console.error('Error getting system info:', error);
      // Fallback values
      setSystemInfo({
        electronVersion: 'Unknown',
        nodeVersion: 'Unknown',
        chromeVersion: 'Unknown'
      });
    }
  };

  const refreshAllConfigurations = async () => {
    setLoading(true);
    try {
      await loadConfigurationStatus();
      showSuccess('Configuration status refreshed successfully');
    } catch (error) {
      showError('Failed to refresh configuration status');
    } finally {
      setLoading(false);
    }
  };

  const clearAllStoredData = async () => {
    if (!window.confirm(
      'Are you sure you want to clear all stored configuration data? This will:\n\n' +
      '• Remove all platform configurations\n' +
      '• Keep your API key secure (stored separately)\n' +
      '• Reset all settings to defaults\n\n' +
      'This action cannot be undone.'
    )) {
      return;
    }

    setLoading(true);
    try {
      // Clear each platform configuration
      const platforms = ['claudeCode', 'crush'];
      for (const platform of platforms) {
        await window.electronAPI.saveConfig(platform, {
          configured: false,
          lastUpdated: null
        });
      }

      // Reload configurations
      await loadConfigurationStatus();
      showSuccess('All configuration data cleared successfully');
      showInfo('Your API key remains securely stored');
    } catch (error) {
      showError('Failed to clear configuration data');
    } finally {
      setLoading(false);
    }
  };

  const exportConfigurationBackup = async () => {
    try {
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        configurations: {
          claudeCode: configurations.claudeCode,
          crush: configurations.crush
        },
        note: 'API key not included for security reasons'
      };

      const backupContent = JSON.stringify(backup, null, 2);
      const blob = new Blob([backupContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `glm-config-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showSuccess('Configuration backup exported successfully');
    } catch (error) {
      showError('Failed to export configuration backup');
    }
  };

  const appInfo = {
    version: '1.0.0',
    buildDate: new Date().toLocaleDateString(),
    electronVersion: systemInfo.electronVersion,
    nodeVersion: systemInfo.nodeVersion,
    chromeVersion: systemInfo.chromeVersion
  };

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage application preferences and configuration data
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Appearance
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    if (isDarkMode) {
                      toggleDarkMode();
                    }
                  }}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    !isDarkMode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Sun className="w-5 h-5 text-yellow-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Light</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Default light theme</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!isDarkMode) {
                      toggleDarkMode();
                    }
                  }}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all cursor-pointer ${
                    isDarkMode
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Moon className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Dark</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</div>
                  </div>
                </button>

                <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg opacity-50">
                  <Monitor className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">System</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Coming soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Configuration Management
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Refresh Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check and update all platform configuration status
                </p>
              </div>
              <button
                onClick={refreshAllConfigurations}
                disabled={loading}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Export Backup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download a backup of your configuration settings
                </p>
              </div>
              <button
                onClick={exportConfigurationBackup}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-200">Clear All Data</h3>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Remove all stored configuration data (API key remains secure)
                </p>
              </div>
              <button
                onClick={clearAllStoredData}
                disabled={loading}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Clear Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Dismiss all current notification messages
                </p>
              </div>
              <button
                onClick={clearAllNotifications}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Application Version</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{appInfo.version}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Build Date</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{appInfo.buildDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Electron Version</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{appInfo.electronVersion}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Node.js Version</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{appInfo.nodeVersion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Chrome Version</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">{appInfo.chromeVersion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform</label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">Windows</p>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                About GLM AI Config
              </h3>
              <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <p>GLM AI Configuration Software simplifies the setup of GLM AI models across Claude Code and Crush platforms.</p>
                <p>This tool provides a secure, user-friendly interface for managing your GLM API credentials and platform configurations.</p>
                <p className="mt-3 font-medium">For support or feedback, please refer to the documentation or contact the development team.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Security & Privacy
              </h3>
              <div className="text-sm text-yellow-600 dark:text-yellow-300 space-y-1">
                <p>• Your API key is encrypted and stored securely in your system's credential storage</p>
                <p>• Configuration data is stored locally and never transmitted to external servers</p>
                <p>• The application only communicates with Z.AI services for authentication and model access</p>
                <p>• Regular security updates ensure your data remains protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;