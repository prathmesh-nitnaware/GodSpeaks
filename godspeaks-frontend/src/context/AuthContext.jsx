import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { loginApi, registerApi } from '../api/authApi';

const ACTIONS = {
  AUTH_START: 'AUTH_START',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER: 'LOAD_USER',
};

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.AUTH_START:
      return { ...state, isLoading: true, error: null };

    case ACTIONS.AUTH_SUCCESS:
      localStorage.setItem('godspeaks_admin', JSON.stringify(action.payload));
      return {
        ...state,
        isLoading: false,
        adminInfo: action.payload,
        error: null,
      };

    case ACTIONS.AUTH_FAILURE:
      return { ...state, isLoading: false, error: action.payload };

    case ACTIONS.LOGOUT:
      localStorage.removeItem('godspeaks_admin');
      return { ...state, adminInfo: null, error: null };

    case ACTIONS.LOAD_USER:
      return { ...state, adminInfo: action.payload, isLoading: false };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = {
    adminInfo: null,
    isLoading: false,
    error: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('godspeaks_admin');
    if (savedAdmin) {
      dispatch({
        type: ACTIONS.LOAD_USER,
        payload: JSON.parse(savedAdmin),
      });
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: ACTIONS.AUTH_START });
    try {
      const data = await loginApi(email, password);
      dispatch({ type: ACTIONS.AUTH_SUCCESS, payload: data });
      return true;
    } catch (error) {
      dispatch({ type: ACTIONS.AUTH_FAILURE, payload: error.message });
      return false;
    }
  };

  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    token: state.adminInfo?.token, // ✅ ADD THIS
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
