import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

const Notification = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success-50 dark:bg-success-900/20',
          border: 'border-success-200 dark:border-success-800',
          icon: 'text-success-400 dark:text-success-500',
          text: 'text-success-800 dark:text-success-200',
          button: 'text-success-500 hover:text-success-600 dark:text-success-400 dark:hover:text-success-300'
        };
      case 'error':
        return {
          bg: 'bg-danger-50 dark:bg-danger-900/20',
          border: 'border-danger-200 dark:border-danger-800',
          icon: 'text-danger-400 dark:text-danger-500',
          text: 'text-danger-800 dark:text-danger-200',
          button: 'text-danger-500 hover:text-danger-600 dark:text-danger-400 dark:hover:text-danger-300'
        };
      case 'warning':
        return {
          bg: 'bg-warning-50 dark:bg-warning-900/20',
          border: 'border-warning-200 dark:border-warning-800',
          icon: 'text-warning-400 dark:text-warning-500',
          text: 'text-warning-800 dark:text-warning-200',
          button: 'text-warning-500 hover:text-warning-600 dark:text-warning-400 dark:hover:text-warning-300'
        };
      case 'info':
      default:
        return {
          bg: 'bg-primary-50 dark:bg-primary-900/20',
          border: 'border-primary-200 dark:border-primary-800',
          icon: 'text-primary-400 dark:text-primary-500',
          text: 'text-primary-800 dark:text-primary-200',
          button: 'text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300'
        };
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const colors = getColors(notification.type);

        return (
          <div
            key={notification.id}
            className={`
              ${colors.bg} ${colors.border} ${colors.text}
              border rounded-lg p-4 shadow-lg
              animate-fade-in
              transition-all duration-300
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${colors.icon}`}>
                {getIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                {notification.title && (
                  <h4 className="text-sm font-medium mb-1">
                    {notification.title}
                  </h4>
                )}
                <p className="text-sm">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => removeNotification(notification.id)}
                className={`
                  flex-shrink-0 p-1 rounded-md transition-colors
                  ${colors.button}
                `}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Notification;