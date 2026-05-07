import React, { createContext, useReducer, useCallback } from 'react';

export const UIContext = createContext();

const initialState = {
  toasts: [],
  modal: { isOpen: false, title: '', content: '' },
};

const uiReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [
          ...state.toasts,
          {
            id: Date.now(),
            ...action.payload,
          },
        ],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };
    case 'OPEN_MODAL':
      return {
        ...state,
        modal: {
          isOpen: true,
          title: action.payload.title,
          content: action.payload.content,
        },
      };
    case 'CLOSE_MODAL':
      return {
        ...state,
        modal: { isOpen: false, title: '', content: '' },
      };
    default:
      return state;
  }
};

export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const addToast = useCallback(
    (message, type = 'info', duration = 3000) => {
      const id = Date.now();
      dispatch({
        type: 'ADD_TOAST',
        payload: { message, type, id },
      });

      // Auto-remove toast after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const openModal = useCallback((title, content) => {
    dispatch({
      type: 'OPEN_MODAL',
      payload: { title, content },
    });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const value = {
    ...state,
    addToast,
    removeToast,
    openModal,
    closeModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
