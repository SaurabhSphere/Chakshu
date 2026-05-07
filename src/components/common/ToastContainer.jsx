import { useUI } from '../../hooks/useUI';
import { Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUI();

  const iconMap = {
    success: CheckCircle,
    error: X,
    warning: AlertTriangle,
    info: Info,
  };

  const getIcon = (type) => {
    return iconMap[type] || Info;
  };

  const getStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-300 text-success-800';
      case 'error':
        return 'bg-danger-50 border-danger-300 text-danger-800';
      case 'warning':
        return 'bg-warning-50 border-warning-300 text-warning-800';
      case 'info':
      default:
        return 'bg-primary-50 border-primary-300 text-primary-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-3">
      {toasts.map((toast) => {
        const Icon = getIcon(toast.type);
        const styles = getStyles(toast.type);

        return (
          <Transition key={toast.id} appear show={true} as={Fragment}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-x-2 opacity-0"
              enterTo="translate-x-0 opacity-100"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0 opacity-100"
              leaveTo="translate-x-2 opacity-0"
            >
              <div
                className={`flex items-start space-x-3 p-4 border rounded-lg shadow-lg ${styles}`}
              >
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-secondary-500 hover:text-secondary-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </Transition.Child>
          </Transition>
        );
      })}
    </div>
  );
};
