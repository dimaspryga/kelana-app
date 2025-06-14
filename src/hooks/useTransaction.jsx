import { useContext } from 'react';
// Import HANYA TransactionContext dari file context
import { TransactionContext } from '@/context/TransactionContext';

export const useTransaction = () => {
  // Gunakan context yang sudah dibuat
  const context = useContext(TransactionContext);

  // Beri peringatan jika hook digunakan di luar provider
  if (context === null) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }

  // Kembalikan nilai dari context
  return context;
};