import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [configurations, setConfigurations] = useState({
    apiKey: {
      configured: false,
      lastUpdated: null
    },
    claudeCode: {
      configured: false,
      envVarsSet: false,
      settingsFileCreated: false,
      selectedModel: null,
      repositoryPath: null,
      lastUpdated: null
    },
    crush: {
      configured: false,
      providersFileModified: false,
      selectedModel: null,
      lastUpdated: null
    },
  });

  const [loading, setLoading] = useState(true);

  // Load configuration status on mount
  useEffect(() => {
    loadConfigurationStatus();
  }, []);

  const loadConfigurationStatus = async () => {
    try {
      setLoading(true);

      // Check if Electron API is available
      if (!window.electronAPI) {
        console.warn('Electron API not available - running in development mode');
        setLoading(false);
        return;
      }

      // Check API key
      const apiKeyResult = await window.electronAPI.getApiKey();

      // Load saved configurations
      const claudeCodeConfig = await window.electronAPI.getConfig('claudeCode');
      const crushConfig = await window.electronAPI.getConfig('crush');

      setConfigurations({
        apiKey: {
          configured: apiKeyResult.success && !!apiKeyResult.apiKey,
          lastUpdated: apiKeyResult.success && apiKeyResult.apiKey ? new Date() : null
        },
        claudeCode: claudeCodeConfig.value || {
          configured: false,
          envVarsSet: false,
          settingsFileCreated: false,
          selectedModel: null,
          repositoryPath: null,
          lastUpdated: null
        },
        crush: crushConfig.value || {
          configured: false,
          providersFileModified: false,
          selectedModel: null,
          lastUpdated: null
        },
      });
    } catch (error) {
      console.error('Error loading configuration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (platform, updates) => {
    const newConfig = {
      ...configurations[platform],
      ...updates,
      lastUpdated: new Date().toISOString()
    };

    setConfigurations(prev => ({
      ...prev,
      [platform]: newConfig
    }));

    // Save to persistent storage
    if (window.electronAPI) {
      await window.electronAPI.saveConfig(platform, newConfig);
    }
  };

  const resetConfiguration = async (platform) => {
    const defaultConfig = {
      configured: false,
      lastUpdated: null
    };

    // Platform-specific defaults
    switch (platform) {
      case 'claudeCode':
        defaultConfig.envVarsSet = false;
        defaultConfig.settingsFileCreated = false;
        defaultConfig.selectedModel = null;
        defaultConfig.repositoryPath = null;
        break;
      case 'crush':
        defaultConfig.providersFileModified = false;
        defaultConfig.selectedModel = null;
        break;
    }

    setConfigurations(prev => ({
      ...prev,
      [platform]: defaultConfig
    }));

    // Save to persistent storage
    if (window.electronAPI) {
      await window.electronAPI.saveConfig(platform, defaultConfig);
    }
  };

  const getOverallStatus = () => {
    const { apiKey, claudeCode, crush } = configurations;

    const totalPlatforms = 2; // Claude Code, Crush
    const configuredPlatforms = [claudeCode, crush].filter(p => p.configured).length;

    return {
      apiKeyConfigured: apiKey.configured,
      platformsConfigured: configuredPlatforms,
      totalPlatforms,
      allConfigured: apiKey.configured && configuredPlatforms === totalPlatforms,
      partiallyConfigured: apiKey.configured && configuredPlatforms > 0
    };
  };

  const value = {
    configurations,
    loading,
    updateConfiguration,
    resetConfiguration,
    loadConfigurationStatus,
    getOverallStatus
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigProvider;