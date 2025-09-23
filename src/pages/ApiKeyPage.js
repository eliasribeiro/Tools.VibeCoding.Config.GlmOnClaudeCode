import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const ApiKeyPage = () => {
  const { configurations, updateConfiguration } = useConfig();
  const { showSuccess, showError, showInfo } = useNotification();

  const [apiKey, setApiKey] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    loadExistingApiKey();
  }, []);

  const loadExistingApiKey = async () => {
    try {
      const result = await window.electronAPI.getApiKey();
      if (result.success && result.apiKey) {
        setHasExistingKey(true);
        setApiKey(result.apiKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      showError('Please enter a valid API key');
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.saveApiKey(apiKey.trim());

      if (result.success) {
        await updateConfiguration('apiKey', {
          configured: true
        });

        setHasExistingKey(true);
        showSuccess('API key saved successfully');
        showInfo('You can now configure platform integrations');
      } else {
        showError(`Failed to save API key: ${result.error}`);
      }
    } catch (error) {
      showError(`Error saving API key: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete the saved API key? This will affect all platform configurations.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await window.electronAPI.deleteApiKey();

      if (result.success) {
        await updateConfiguration('apiKey', {
          configured: false
        });

        setApiKey('');
        setHasExistingKey(false);
        showSuccess('API key deleted successfully');
      } else {
        showError(`Failed to delete API key: ${result.error}`);
      }
    } catch (error) {
      showError(`Error deleting API key: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const maskApiKey = (key) => {
    if (!key || key.length <= 8) return key;
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Key className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            API Key Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Securely manage your GLM API key for all platform integrations
        </p>
      </div>

      {/* Status Card */}
      <div className={`p-4 rounded-lg border mb-6 ${
        configurations.apiKey.configured
          ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
          : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
      }`}>
        <div className="flex items-center space-x-3">
          {configurations.apiKey.configured ? (
            <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
          )}
          <div>
            <h3 className={`font-medium ${
              configurations.apiKey.configured
                ? 'text-success-800 dark:text-success-200'
                : 'text-warning-800 dark:text-warning-200'
            }`}>
              {configurations.apiKey.configured ? 'API Key Configured' : 'API Key Required'}
            </h3>
            <p className={`text-sm ${
              configurations.apiKey.configured
                ? 'text-success-600 dark:text-success-300'
                : 'text-warning-600 dark:text-warning-300'
            }`}>
              {configurations.apiKey.configured
                ? 'Your GLM API key is securely stored and ready to use'
                : 'Please configure your GLM API key to enable platform integrations'
              }
            </p>
          </div>
        </div>
      </div>

      {/* API Key Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {hasExistingKey ? 'Update API Key' : 'Configure API Key'}
        </h2>

        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GLM API Key
            </label>
            <div className="relative">
              <input
                type={isVisible ? 'text' : 'password'}
                id="apiKey"
                value={isVisible ? apiKey : (hasExistingKey && !isVisible ? maskApiKey(apiKey) : apiKey)}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your GLM API key"
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Your API key is encrypted and stored securely on your local machine
            </p>
          </div>

          {/* How to get API Key */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  How to get your GLM API Key
                </h4>
                <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                  <p>1. Visit the Z.AI platform website</p>
                  <p>2. Sign in to your account or create a new one</p>
                  <p>3. Navigate to the API section in your dashboard</p>
                  <p>4. Generate a new API key or copy your existing one</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              disabled={loading || !apiKey.trim()}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : (hasExistingKey ? 'Update' : 'Save API Key')}</span>
            </button>

            {hasExistingKey && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center space-x-2 bg-danger-600 hover:bg-danger-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Key</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Security & Privacy
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <p>• Your API key is encrypted using your system's secure credential storage</p>
          <p>• The key is never transmitted or logged in plain text</p>
          <p>• Only this application can access your stored credentials</p>
          <p>• You can delete your API key at any time</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyPage;