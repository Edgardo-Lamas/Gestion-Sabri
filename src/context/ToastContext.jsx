import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>
                        <span className="toast-message">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="toast-close">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .toast-container {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    z-index: 2000;
                    pointer-events: none; /* Allow clicks through container */
                }

                .toast {
                    pointer-events: auto;
                    min-width: 300px;
                    background: white;
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    animation: slideInRight 0.3s ease-out;
                    border-left: 4px solid;
                }

                .toast-success { border-left-color: var(--secondary); }
                .toast-error { border-left-color: var(--error); }
                .toast-info { border-left-color: var(--primary); }

                .toast-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-top: 2px;
                }
                
                .toast-success .toast-icon { color: var(--secondary); }
                .toast-error .toast-icon { color: var(--error); }
                .toast-info .toast-icon { color: var(--primary); }

                .toast-message {
                    flex: 1;
                    font-size: 0.9rem;
                    color: var(--text);
                    line-height: 1.4;
                }

                .toast-close {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: var(--text-muted);
                    padding: 2px;
                    display: flex;
                    transition: color 0.2s;
                }

                .toast-close:hover {
                    color: var(--text);
                }

                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @media (max-width: 640px) {
                    .toast-container {
                        bottom: 1rem;
                        right: 1rem;
                        left: 1rem;
                    }
                    .toast {
                        min-width: auto;
                        width: 100%;
                    }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
