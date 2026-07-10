'use client';
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { saveCartToFirestore, saveWishlistToFirestore, getCartFromFirestore, getWishlistFromFirestore } from './firestore';

const StoreContext = createContext(null);

const initialState = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  searchHistory: [],
  cartOpen: false,
  searchOpen: false,
  toasts: [],
};

function storeReducer(state, action) {
  switch (action.type) {
    case 'INIT_FROM_STORAGE':
      return { ...state, ...action.payload };

    case 'ADD_TO_CART': {
      const existing = state.cart.find(
        (item) => item.id === action.payload.id && item.variant === action.payload.variant
      );
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === existing.id && item.variant === existing.variant
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          cartOpen: true,
        };
      }
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: action.payload.quantity || 1 }],
        cartOpen: true,
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(
          (item) => !(item.id === action.payload.id && item.variant === action.payload.variant)
        ),
      };

    case 'UPDATE_CART_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id && item.variant === action.payload.variant
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'TOGGLE_WISHLIST': {
      const exists = state.wishlist.find((id) => id === action.payload);
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };
    }

    case 'ADD_RECENTLY_VIEWED': {
      const filtered = state.recentlyViewed.filter((id) => id !== action.payload);
      return {
        ...state,
        recentlyViewed: [action.payload, ...filtered].slice(0, 10),
      };
    }

    case 'ADD_SEARCH_HISTORY': {
      const filtered = state.searchHistory.filter((q) => q !== action.payload);
      return {
        ...state,
        searchHistory: [action.payload, ...filtered].slice(0, 8),
      };
    }

    case 'TOGGLE_CART':
      return { ...state, cartOpen: !state.cartOpen };

    case 'SET_CART_OPEN':
      return { ...state, cartOpen: action.payload };

    case 'TOGGLE_SEARCH':
      return { ...state, searchOpen: !state.searchOpen };

    case 'SET_SEARCH_OPEN':
      return { ...state, searchOpen: action.payload };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now(), ...action.payload }],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const { user } = useAuth(); // We need AuthContext to wrap StoreProvider in layout.js

  // Initial load from localStorage
  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem('zameon_cart') || '[]');
      const wishlist = JSON.parse(localStorage.getItem('zameon_wishlist') || '[]');
      const recentlyViewed = JSON.parse(localStorage.getItem('zameon_recent') || '[]');
      const searchHistory = JSON.parse(localStorage.getItem('zameon_search') || '[]');
      dispatch({
        type: 'INIT_FROM_STORAGE',
        payload: { cart, wishlist, recentlyViewed, searchHistory },
      });
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // When user logs in, merge or load their cart/wishlist from Firestore
  useEffect(() => {
    if (user) {
      const loadFirestoreData = async () => {
        try {
          const fbCart = await getCartFromFirestore(user.uid);
          const fbWishlist = await getWishlistFromFirestore(user.uid);
          
          // Basic logic: if local cart is empty but FB has items, load FB.
          // Otherwise keep local and let it sync up on next change.
          const currentCart = JSON.parse(localStorage.getItem('zameon_cart') || '[]');
          const currentWishlist = JSON.parse(localStorage.getItem('zameon_wishlist') || '[]');
          
          if (currentCart.length === 0 && fbCart.length > 0) {
            dispatch({ type: 'INIT_FROM_STORAGE', payload: { cart: fbCart } });
          }
          if (currentWishlist.length === 0 && fbWishlist.length > 0) {
            dispatch({ type: 'INIT_FROM_STORAGE', payload: { wishlist: fbWishlist } });
          }
        } catch (e) {
          console.error("Error loading cart/wishlist from Firestore", e);
        }
      };
      loadFirestoreData();
    }
  }, [user]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('zameon_cart', JSON.stringify(state.cart));
    if (user) {
      saveCartToFirestore(user.uid, state.cart).catch(e => console.error(e));
    }
  }, [state.cart, user]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('zameon_wishlist', JSON.stringify(state.wishlist));
    if (user) {
      saveWishlistToFirestore(user.uid, state.wishlist).catch(e => console.error(e));
    }
  }, [state.wishlist, user]);

  useEffect(() => {
    localStorage.setItem('zameon_recent', JSON.stringify(state.recentlyViewed));
  }, [state.recentlyViewed]);

  useEffect(() => {
    localStorage.setItem('zameon_search', JSON.stringify(state.searchHistory));
  }, [state.searchHistory]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

export function useCart() {
  const { state, dispatch } = useStore();

  const addToCart = useCallback((product, variant = 'default', quantity = 1) => {
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        variant,
        quantity,
      },
    });
    dispatch({
      type: 'ADD_TOAST',
      payload: { message: `${product.name} added to cart`, type: 'success' },
    });
  }, [dispatch]);

  const removeFromCart = useCallback((id, variant = 'default') => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, variant } });
  }, [dispatch]);

  const updateQuantity = useCallback((id, variant, quantity) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { id, variant, quantity } });
  }, [dispatch]);

  const cartTotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: state.cart,
    total: cartTotal,
    count: cartCount,
    isOpen: state.cartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
    setCartOpen: (open) => dispatch({ type: 'SET_CART_OPEN', payload: open }),
    clearCart: () => dispatch({ type: 'CLEAR_CART' }),
  };
}

export function useWishlist() {
  const { state, dispatch } = useStore();
  return {
    items: state.wishlist,
    isWished: (id) => state.wishlist.includes(id),
    toggle: (id) => dispatch({ type: 'TOGGLE_WISHLIST', payload: id }),
  };
}
