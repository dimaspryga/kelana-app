import { useContext } from 'react';
// Impor CartContext dari file context-nya
import { CartContext } from '@/context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};