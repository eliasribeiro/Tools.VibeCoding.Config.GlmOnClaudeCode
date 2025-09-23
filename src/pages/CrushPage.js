import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Square,
  RefreshCw,
  Info,
  FileText,
  Terminal,
  Download
} from 'lucide-react';

const CrushPage = () => {
  const { configurations, updateConfiguration } = useConfig();
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('glm-4.5');
  const [providersFileExists, setProvidersFileExists] = useState(false);
  const [providersFileContent, setProvidersFileContent] = useState(null);
  const [crusIsInstalled, setCrusIsInstalled] = useState(false);

  const models = [
    {
      id: 'glm-4.5',
      name: 'GLM-4.5',
      description: 'Advanced model for complex coding tasks'
    },
    {
      id: 'glm-4.5-air',
      name: 'GLM-4.5-Air',
      description: 'Lightweight model for quick tasks'
    }
  ];

  useEffect(() => {
    loadCurrentConfiguration();
    checkCrushInstallation();
    checkProvidersFile();
  }, []);

  const loadCurrentConfiguration = () => {
    const config = configurations.crush;
    if (config.selectedModel) {
      setSelectedModel(config.selectedModel);
    }
  };

  const checkCrushInstallation = async () => {
    try {
      const result = await window.electronAPI.executeCommand('crush --version');
      setCrusIsInstalled(result.success);
      if (!result.success) {
        showWarning('Crush CLI not found. Please install Crush first.');
      }
    } catch (error) {
      setCrusIsInstalled(false);
    }
  };

  const checkProvidersFile = async () => {
    try {
      const systemInfo = await window.electronAPI.getSystemInfo();
      if (!systemInfo.success) return;

      const providersPath = `${systemInfo.info.homedir}\\AppData\\Local\\crush\\providers.json`;
      const fileExists = await window.electronAPI.fileExists(providersPath);

      setProvidersFileExists(fileExists.exists);

      if (fileExists.exists) {
        const fileContent = await window.electronAPI.readFile(providersPath);
        if (fileContent.success) {
          try {
            const parsedContent = JSON.parse(fileContent.content);
            setProvidersFileContent(parsedContent);
          } catch (error) {
            showError('Failed to parse providers.json file');
          }
        }
      }
    } catch (error) {
      console.error('Error checking providers file:', error);
    }
  };

  const runInitialSetup = async () => {
    if (!configurations.apiKey.configured) {
      showError('Please configure your API key first');
      return;
    }

    if (!crusIsInstalled) {
      showError('Crush CLI is not installed. Please install Crush first.');
      return;
    }

    setLoading(true);
    try {
      showInfo('Starting Crush initial setup. This may take a moment...');

      // Get API key
      const apiKeyResult = await window.electronAPI.getApiKey();
      if (!apiKeyResult.success || !apiKeyResult.apiKey) {
        showError('Failed to retrieve API key');
        return;
      }

      // Run crush command to initialize
      const crushResult = await window.electronAPI.executeCommand('crush');

      if (crushResult.success || crushResult.stderr.includes('provider')) {
        // The command succeeded or at least initialized the config
        showSuccess('Crush initialization completed');
        setTimeout(() => {
          checkProvidersFile();
        }, 2000); // Wait a bit for file creation
      } else {
        showWarning('Crush command executed but may need manual intervention');
      }
    } catch (error) {
      showError(`Error during initial setup: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const modifyProvidersFile = async () => {
    if (!providersFileExists) {
      showError('Providers file not found. Please run initial setup first.');
      return;
    }

    setLoading(true);
    try {
      const systemInfo = await window.electronAPI.getSystemInfo();
      const providersPath = `${systemInfo.info.homedir}\\AppData\\Local\\crush\\providers.json`;

      // Read current content
      const fileContent = await window.electronAPI.readFile(providersPath);
      if (!fileContent.success) {
        showError('Failed to read providers.json file');
        return;
      }

      // Backup original file
      const backupPath = `${providersPath}.backup.${Date.now()}`;
      await window.electronAPI.writeFile(backupPath, fileContent.content);

      // Use string replacement to update the URL directly
      const oldUrl = 'https://api.z.ai/api/paas/v4';
      const newUrl = 'https://api.z.ai/api/coding/paas/v4';

      let modifiedContent = fileContent.content;

      // Replace the URL in the content
      if (modifiedContent.includes(oldUrl)) {
        modifiedContent = modifiedContent.replace(new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newUrl);
        showInfo(`URL updated from ${oldUrl} to ${newUrl}`);
      } else {
        showWarning(`Original URL ${oldUrl} not found in providers file`);
        return;
      }
      const writeResult = await window.electronAPI.writeFile(providersPath, modifiedContent);

      if (writeResult.success) {
        // Reload the providers file to update the state
        await checkProvidersFile();
        await updateConfiguration('crush', {
          providersFileModified: true,
          selectedModel,
          configured: true
        });

        showSuccess('Providers file updated successfully');
        showInfo(`Backup created at: ${backupPath}`);
      } else {
        showError(`Failed to write providers file: ${writeResult.error}`);
      }
    } catch (error) {
      showError(`Error modifying providers file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const restoreProvidersFile = async () => {
    if (!window.confirm('Are you sure you want to restore the original providers.json file? This will undo all GLM-specific modifications.')) {
      return;
    }

    setLoading(true);
    try {
      const systemInfo = await window.electronAPI.getSystemInfo();
      const providersPath = `${systemInfo.info.homedir}\\AppData\\Local\\crush\\providers.json`;

      // Read current content
      const fileContent = await window.electronAPI.readFile(providersPath);
      if (!fileContent.success) {
        showError('Failed to read providers.json file');
        return;
      }

      // Use string replacement to restore the original URL
      const newUrl = 'https://api.z.ai/api/coding/paas/v4';
      const oldUrl = 'https://api.z.ai/api/paas/v4';

      let restoredContent = fileContent.content;

      // Replace the URL back to original
      if (restoredContent.includes(newUrl)) {
        restoredContent = restoredContent.replace(new RegExp(newUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), oldUrl);
        showInfo(`URL restored from ${newUrl} to ${oldUrl}`);
      } else {
        showWarning(`Modified URL ${newUrl} not found in providers file`);
        return;
      }
      const writeResult = await window.electronAPI.writeFile(providersPath, restoredContent);

      if (writeResult.success) {
        // Reload the providers file to update the state
        await checkProvidersFile();
        await updateConfiguration('crush', {
          configured: false,
          providersFileModified: false,
          selectedModel: null
        });

        showSuccess('Providers file restored successfully');
      } else {
        showError(`Failed to restore providers file: ${writeResult.error}`);
      }
    } catch (error) {
      showError(`Error restoring providers file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadCrush = () => {
    // This would typically open the download link in the default browser
    showInfo('Please visit the Z.AI website to download and install Crush CLI');
  };

  const canConfigure = configurations.apiKey.configured && crusIsInstalled;
  const isModified = providersFileContent?.providers?.some(p =>
    (p.name === 'Z.AI' || p.id === 'z.ai') &&
    p.endpoint === 'https://api.z.ai/api/coding/paas/v4'
  );

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Crush Configuration
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure Crush CLI to use GLM AI models with the Coding Plan endpoint
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-lg border ${
          configurations.apiKey.configured
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
        }`}>
          <div className="flex items-center space-x-2">
            {configurations.apiKey.configured ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">API Key</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {configurations.apiKey.configured ? 'Ready' : 'Required'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          crusIsInstalled
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
        }`}>
          <div className="flex items-center space-x-2">
            {crusIsInstalled ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">Crush CLI</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {crusIsInstalled ? 'Installed' : 'Not Found'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          providersFileExists
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center space-x-2">
            {providersFileExists ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">Config File</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {providersFileExists ? 'Found' : 'Not Found'}
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          configurations.crush.configured
            ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center space-x-2">
            {configurations.crush.configured ? (
              <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />
            ) : (
              <XCircle className="w-5 h-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">Overall</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {configurations.crush.configured ? 'Complete' : 'Incomplete'}
          </p>
        </div>
      </div>

      {/* Configuration Steps */}
      <div className="space-y-6">
        {/* Step 0: Install Crush (if not installed) */}
        {!crusIsInstalled && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Step 0: Install Crush CLI
              </h2>
              <Download className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Crush CLI needs to be installed before configuration
            </p>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Installation Required
                  </h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Please install Crush CLI from the Z.AI website before proceeding.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={downloadCrush}
                className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Crush</span>
              </button>

              <button
                onClick={checkCrushInstallation}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Check Installation</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Initial Setup */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 1: Initial Crush Setup
            </h2>
            <Terminal className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Run initial Crush setup to create configuration files
          </p>

          <button
            onClick={runInitialSetup}
            disabled={loading || !canConfigure || providersFileExists}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : providersFileExists ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>
              {providersFileExists ? 'Setup Complete' : 'Run Initial Setup'}
            </span>
          </button>
        </div>

        {/* Step 2: Model Selection & Provider Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Step 2: Configure GLM Provider
            </h2>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Select GLM model and update providers.json for Coding Plan endpoint
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

          {/* Endpoint Configuration */}
          {providersFileContent && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Current Endpoint Configuration
              </h4>
              <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {isModified ? (
                  <span className="text-success-600 dark:text-success-400">
                    ✓ https://api.z.ai/api/coding/paas/v4 (GLM Coding Plan)
                  </span>
                ) : (
                  <span className="text-warning-600 dark:text-warning-400">
                    ⚠ https://api.z.ai/api/paas/v4 (Default)
                  </span>
                )}
              </div>
            </div>
          )}

          <button
            onClick={modifyProvidersFile}
            disabled={loading || !providersFileExists || isModified}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : isModified ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>
              {isModified ? 'Configuration Applied' : 'Apply GLM Configuration'}
            </span>
          </button>
        </div>

        {/* Actions */}
        {configurations.crush.configured && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuration Actions
            </h2>

            <div className="flex space-x-4">
              <button
                onClick={checkProvidersFile}
                className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>

              <button
                onClick={restoreProvidersFile}
                disabled={loading}
                className="flex items-center space-x-2 bg-danger-600 hover:bg-danger-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Restore Original</span>
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
                Usage Instructions
              </h3>
              <div className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
                <p>1. After configuration, launch Crush CLI in your terminal</p>
                <p>2. Select Z.AI as your provider when prompted</p>
                <p>3. Choose your preferred GLM model ({selectedModel})</p>
                <p>4. GLM Coding Plan features will be automatically available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrushPage;