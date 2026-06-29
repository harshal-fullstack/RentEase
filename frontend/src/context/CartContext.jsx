import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

const getSafeCart = () => {
  try {
    const localData = localStorage.getItem('rentease_cart');
    return localData ? JSON.parse(localData) : [];
  } catch (e) {
    console.warn('localStorage not accessible, falling back to empty in-memory cart:', e);
    return [];
  }
};

const setSafeCart = (cart) => {
  try {
    localStorage.setItem('rentease_cart', JSON.stringify(cart));
  } catch (e) {
    console.warn('localStorage not accessible, cart will not persist:', e);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => getSafeCart());

  useEffect(() => {
    setSafeCart(cart);
  }, [cart]);

  const addToCart = (product, tenure, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === product._id && item.tenure === Number(tenure)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += Number(quantity);
        return newCart;
      } else {
        return [
          ...prevCart,
          {
            productId: product._id,
            product,
            tenure: Number(tenure),
            quantity: Number(quantity),
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, tenure) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.productId === productId && item.tenure === Number(tenure))
      )
    );
  };

  const updateCartQuantity = (productId, tenure, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, tenure);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.tenure === Number(tenure)
          ? { ...item, quantity: Number(quantity) }
          : item
      )
    );
  };

  const updateCartTenure = (productId, oldTenure, newTenure) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.productId === productId && item.tenure === Number(newTenure)
      );

      const oldItemIndex = prevCart.findIndex(
        (item) => item.productId === productId && item.tenure === Number(oldTenure)
      );

      if (oldItemIndex === -1) return prevCart;

      const newCart = [...prevCart];
      const itemToMove = newCart[oldItemIndex];

      if (existingItemIndex > -1 && existingItemIndex !== oldItemIndex) {
        newCart[existingItemIndex].quantity += itemToMove.quantity;
        newCart.splice(oldItemIndex, 1);
      } else {
        newCart[oldItemIndex] = { ...itemToMove, tenure: Number(newTenure) };
      }

      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const totalDeposit = cart.reduce(
    (acc, item) => acc + item.product.deposit * item.quantity,
    0
  );

  const totalMonthly = cart.reduce(
    (acc, item) => acc + item.product.pricing[item.tenure] * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartTenure,
        clearCart,
        cartCount,
        totalDeposit,
        totalMonthly,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);