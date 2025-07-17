import { useContext } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AlertContext from '../../context/AlertContext';

const Alert = () => {
  const { alerts, removeAlert } = useContext(AlertContext);

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {alerts.map((alert) => {
        let bgColor, textColor, borderColor;

        switch (alert.type) {
          case 'success':
            bgColor = 'bg-green-50';
            textColor = 'text-green-800';
            borderColor = 'border-green-400';
            break;
          case 'error':
            bgColor = 'bg-red-50';
            textColor = 'text-red-800';
            borderColor = 'border-red-400';
            break;
          case 'warning':
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-800';
            borderColor = 'border-yellow-400';
            break;
          default:
            bgColor = 'bg-blue-50';
            textColor = 'text-blue-800';
            borderColor = 'border-blue-400';
        }

        return (
          <div
            key={alert.id}
            className={`${bgColor} ${textColor} ${borderColor} border-l-4 p-4 rounded-md shadow-md animate-fade-in-down`}
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm">{alert.msg}</p>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Alert;
