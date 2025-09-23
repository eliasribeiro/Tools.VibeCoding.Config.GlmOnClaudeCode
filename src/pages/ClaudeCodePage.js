import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  Terminal,
  FolderOpen,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Info,
  Download
} from 'lucide-react';

const ClaudeCodePage = () => {
  const { configurations, updateConfiguration } = useConfig();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('GLM-4.5');
  const [repositoryPath, setRepositoryPath] = useState('');
  const [envVarsStatus, setEnvVarsStatus] = useState({
    ANTHROPIC_BASE_URL: null,
    ANTHROPIC_AUTH_TOKEN: null
  });

  const models = [
    {
      id: 'GLM-4.5',
      name: 'GLM-4.5',
      description: 'Recommended for dialogue, planning, coding, and complex reasoning',
      anthropicModel: 'claude-3-5-sonnet-20241022'
    },
    {
      id: 'GLM-4.5-Air',
      name: 'GLM-4.5-Air',
      description: 'Recommended for file search, syntax checking, and auxiliary tasks',
      anthropicModel: 'claude-3-haiku-20240307'
    }
  ];

  useEffect(() => {
    loadCurrentConfiguration();
    checkEnvironmentVariables();
  }, []);

  const loadCurrentConfiguration = () => {
    const config = configurations.claudeCode;
    if (config.selectedModel) {
      setSelectedModel(config.selectedModel);
    }
    if (config.repositoryPath) {
      setRepositoryPath(config.repositoryPath);
    }
  };

  const checkEnvironmentVariables = async () => {
    try {
      const result = await window.electronAPI.getEnvVars(['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN']);
      if (result.success) {
        setEnvVarsStatus(result.values);
      }
    } catch (error) {
      console.error('Error checking environment variables:', error);
    }
  };

  const selectRepository = async () => {
    try {
      const result = await window.electronAPI.selectDirectory();
      if (result.success) {
        setRepositoryPath(result.path);
        showInfo('Repository selected successfully');
      }
    } catch (error) {
      showError(`Error selecting repository: ${error.message}`);
    }
  };

  const configureEnvironmentVariables = async () => {
    if (!configurations.apiKey.configured) {
      showError('Please configure your API key first');
      return;
    }

    setLoading(true);
    try {
      // Get API key
      const apiKeyResult = await window.electronAPI.getApiKey();
      if (!apiKeyResult.success || !apiKeyResult.apiKey) {
        showError('Failed to retrieve API key');
        return;
      }

      // Set environment variables
      const envVars = {
        ANTHROPIC_BASE_URL: 'https://api.z.ai/api/anthropic',
        ANTHROPIC_AUTH_TOKEN: apiKeyResult.apiKey
      };

      const result = await window.electronAPI.setEnvVars(envVars);
      if (result.success) {
        // Reload environment variables status to confirm they were set
        await checkEnvironmentVariables();
        await updateConfiguration('claudeCode', {
          envVarsSet: true
        });
        showSuccess('Environment variables configured successfully');
        showInfo('Restart your terminal for changes to take effect');
      } else {
        showError(`Failed to set environment variables: ${result.error}`);
      }
    } catch (error) {
      showError(`Error configuring environment variables: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const removeEnvironmentVariables = async () => {
    if (!window.confirm('Are you sure you want to remove the environment variables? This will require reconfiguration to use Claude Code.')) {
      return;
    }

    setLoading(true);
    try {
      // Remove environment variables
      const result = await window.electronAPI.removeEnvVars(['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN']);

      if (result.success) {
        // Reset environment variables status
        setEnvVarsStatus({
          ANTHROPIC_BASE_URL: null,
          ANTHROPIC_AUTH_TOKEN: null
        });

        // Update configuration
        await updateConfiguration('claudeCode', {
          envVarsSet: false
        });

        showSuccess('Environment variables removed successfully');
        showInfo('Restart your terminal for changes to take effect');
      } else {
        showError(`Failed to remove environment variables: ${result.error}`);
      }
    } catch (error) {
      showError(`Error removing environment variables: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSettingsFile = async () => {
    if (!repositoryPath) {
      showError('Please select a repository directory first');
      return;
    }

    setLoading(true);
    try {
      const selectedModelConfig = models.find(m => m.id === selectedModel);
      const settingsPath = `${repositoryPath}\\.claude`;
      const settingsFilePath = `${settingsPath}\\settings.json`;

      // Create .claude directory if it doesn't exist
      await window.electronAPI.createDirectory(settingsPath);

      // Create settings.json content
      const settings = {
        env: {
          ANTHROPIC_MODEL: selectedModel === 'GLM-4.5-Air' ? 'glm-4.5-air' : 'glm-4.5'
        }
      };

      const settingsContent = JSON.stringify(settings, null, 2);

      // Write settings file
      const result = await window.electronAPI.writeFile(settingsFilePath, settingsContent);
      if (result.success) {
        await updateConfiguration('claudeCode', {
          settingsFileCreated: true,
          selectedModel,
          repositoryPath
        });
        showSuccess('Settings file created successfully');
        checkOverallConfiguration();
      } else {
        showError(`Failed to create settings file: ${result.error}`);
      }
    } catch (error) {
      showError(`Error creating settings file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkOverallConfiguration = async () => {
    const envVarsConfigured = envVarsStatus.ANTHROPIC_BASE_URL && envVarsStatus.ANTHROPIC_AUTH_TOKEN;
    const settingsFileExists = configurations.claudeCode.settingsFileCreated;

    if (envVarsConfigured && settingsFileExists) {
      await updateConfiguration('claudeCode', {
        configured: true
      });
    }
  };

  const removeConfiguration = async () => {
    if (!window.confirm('Are you sure you want to remove Claude Code configuration? This will remove environment variables and settings files.')) {
      return;
    }

    setLoading(true);
    try {
      // Remove environment variables
      const removeEnvResult = await window.electronAPI.removeEnvVars(['ANTHROPIC_BASE_URL', 'ANTHROPIC_AUTH_TOKEN']);

      setEnvVarsStatus({
        ANTHROPIC_BASE_URL: null,
        ANTHROPIC_AUTH_TOKEN: null
      });

      // Reset configuration
      await updateConfiguration('claudeCode', {
        configured: false,
        envVarsSet: false,
        settingsFileCreated: false,
        selectedModel: null,
        repositoryPath: null
      });

      setRepositoryPath('');
      setSelectedModel('GLM-4.5');

      showSuccess('Claude Code configuration removed successfully');
    } catch (error) {
      showError(`Error removing configuration: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const envVarsConfigured = envVarsStatus.ANTHROPIC_BASE_URL && envVarsStatus.ANTHROPIC_AUTH_TOKEN;
  const canConfigure = configurations.apiKey.configured;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Terminal className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Claude Code Configuration
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure Claude Code to use GLM AI models for enhanced coding assistance
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`p-4 rounded-lg border ${
          canConfigure
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
        }`}>
          <div className="flex items-center space-x-2">
            {canConfigure ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">API Key</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {canConfigure ? 'Ready' : 'Required'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          envVarsConfigured
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center space-x-2">
            {envVarsConfigured ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">Environment</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {envVarsConfigured ? 'Configured' : 'Not Set'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          configurations.claudeCode.configured
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center space-x-2">
            {configurations.claudeCode.configured ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">Overall</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {configurations.claudeCode.configured ? 'Complete' : 'Incomplete'}
          </p>
        </div>
      </div>

      {/* Configuration Steps */}
      <div className="space-y-6">
        {/* Step 1: Environment Variables */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 1: Environment Variables
            </h2>
            <div className="flex items-center space-x-2">
              {envVarsConfigured ? (
                <CheckCircle className="w-5 h-5 text-success-500" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure system environment variables for Claude Code authentication
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                ANTHROPIC_BASE_URL
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {envVarsStatus.ANTHROPIC_BASE_URL || 'Not set'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                ANTHROPIC_AUTH_TOKEN
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                {envVarsStatus.ANTHROPIC_AUTH_TOKEN ? '••••••••' : 'Not set'}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={configureEnvironmentVariables}
              disabled={loading || !canConfigure || envVarsConfigured}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : envVarsConfigured ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>
                {envVarsConfigured ? 'Configured' : 'Configure Environment Variables'}
              </span>
            </button>

            {envVarsConfigured && (
              <button
                onClick={removeEnvironmentVariables}
                disabled={loading}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Remove Configuration</span>
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Repository Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 2: Repository Configuration
            </h2>
            <Settings className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create a .claude/settings.json file in your repository to specify the GLM model
          </p>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select GLM Model
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <label
                  key={model.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedModel === model.id
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedModel === model.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {model.description}
                  </p>
                </label>
              ))}
            </div>
          </div>

          {/* Repository Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repository Directory
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={repositoryPath}
                placeholder="Select a repository directory..."
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={selectRepository}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse</span>
              </button>
            </div>
          </div>

          <button
            onClick={createSettingsFile}
            disabled={loading || !repositoryPath || !selectedModel}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Create Settings File</span>
          </button>
        </div>

        {/* Actions */}
        {configurations.claudeCode.configured && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuration Actions
            </h2>

            <div className="flex space-x-4">
              <button
                onClick={checkEnvironmentVariables}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

              <button
                onClick={removeConfiguration}
                disabled={loading}
                className="flex items-center space-x-2 bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Remove Configuration</span>
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Next Steps
              </h3>
              <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <p>1. After configuration, restart your terminal application</p>
                <p>2. Navigate to your configured repository</p>
                <p>3. Run Claude Code commands as usual</p>
                <p>4. GLM AI models will be used automatically</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaudeCodePage;