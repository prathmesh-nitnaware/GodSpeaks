import React, { createContext, useContext, useReducer, useEffect } from 'react';

// --- 1. Define Action Types ---
const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  LOAD_CART: 'LOAD_CART',
  CLEAR_CART: 'CLEAR_CART',
};

// --- 2. Create the Context ---
const CartContext = createContext();

// --- 3. The Reducer Function ---
const cartReducer = (state, action) => {
  let newCart = [];
  
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const { product, size, qty } = action.payload;
      const cartItemId = `${product._id}-${size}`;
      
      const existingItem = state.cart.find(item => item.cartItemId === cartItemId);

      if (existingItem) {
        newCart = state.cart.map(item =>
          item.cartItemId === cartItemId ? { ...item, qty: item.qty + qty } : item
        );
      } else {
        const newItem = {
          ...product,
          cartItemId,
          size,
          qty,
        };
        newCart = [...state.cart, newItem];
      }
      break;
    }

    case ACTIONS.REMOVE_ITEM: {
      newCart = state.cart.filter(item => item.cartItemId !== action.payload.cartItemId);
      break;
    }

    case ACTIONS.UPDATE_QUANTITY: {
      newCart = state.cart.map(item =>
        item.cartItemId === action.payload.cartItemId ? { ...item, qty: action.payload.qty } : item
      );
      break;
    }
    
    case ACTIONS.LOAD_CART: {
      return action.payload;
    }

    case ACTIONS.CLEAR_CART: {
      const emptyState = { cart: [], totalItems: 0, totalPrice: 0 };
      localStorage.removeItem('godspeaks_cart');
      return emptyState;
    }

    default:
      return state;
  }

  const { totalItems, totalPrice } = calculateTotals(newCart);
  const newState = { cart: newCart, totalItems, totalPrice };
  
  localStorage.setItem('godspeaks_cart', JSON.stringify(newState));
  
  return newState;
};

// --- Helper function to calculate totals ---
const calculateTotals = (cart) => {
  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  const totalPrice = cart.reduce((total, item) => total + (Number(item.price) * Number(item.qty)), 0);
  return { totalItems, totalPrice };
};

// Initial state definition
const initialState = {
  cart: [],
  totalItems: 0,
  totalPrice: 0,
};

// --- 4. The Context Provider Component ---
export const CartProvider = ({ children }) => {
  
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('godspeaks_cart');
    if (savedCart) {
      dispatch({ type: ACTIONS.LOAD_CART, payload: JSON.parse(savedCart) });
    }
  }, []);

  // --- 6. Action Functions ---
  const addItemToCart = (product, size, qty = 1) => {
    dispatch({ type: ACTIONS.ADD_ITEM, payload: { product, size, qty } });
  };

  const removeItemFromCart = (cartItemId) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: { cartItemId } });
  };
  
  const updateItemQuantity = (cartItemId, qty) => {
    if (qty <= 0) {
      removeItemFromCart(cartItemId);
    } else {
      dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { cartItemId, qty } });
    }
  };

  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  };

  const value = {
    ...state, // cart, totalItems, totalPrice
    addItemToCart,
    removeItemFromCart,
    updateItemQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// --- 7. Custom Hook ---
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};