import { useContext } from 'react';
import { TransactionContext } from '@/context/TransactionContext';

export const useTransaction = () => {

  const context = useContext(TransactionContext);


  if (context === null) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }

  return context;
};