import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Action Types
const ACTIONS = {
  ADD_TO_WISHLIST: 'ADD_TO_WISHLIST',
  REMOVE_FROM_WISHLIST: 'REMOVE_FROM_WISHLIST',
  LOAD_WISHLIST: 'LOAD_WISHLIST',
};

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
  let newWishlist;
  switch (action.type) {
    case ACTIONS.ADD_TO_WISHLIST:
      // Avoid duplicates
      if (state.wishlist.find(item => item._id === action.payload._id)) {
        return state;
      }
      newWishlist = [...state.wishlist, action.payload];
      break;
    case ACTIONS.REMOVE_FROM_WISHLIST:
      newWishlist = state.wishlist.filter(item => item._id !== action.payload);
      break;
    case ACTIONS.LOAD_WISHLIST:
      return { wishlist: action.payload };
    default:
      return state;
  }

  // Sync with local storage
  localStorage.setItem('godspeaks_wishlist', JSON.stringify(newWishlist));
  return { wishlist: newWishlist };
};

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, { wishlist: [] });

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('godspeaks_wishlist');
    if (savedWishlist) {
      dispatch({ type: ACTIONS.LOAD_WISHLIST, payload: JSON.parse(savedWishlist) });
    }
  }, []);

  const addToWishlist = (product) => {
    dispatch({ type: ACTIONS.ADD_TO_WISHLIST, payload: product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_WISHLIST, payload: productId });
  };

  const isInWishlist = (productId) => {
    return state.wishlist.some(item => item._id === productId);
  };

  const value = {
    wishlist: state.wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};