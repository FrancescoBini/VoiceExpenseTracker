'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FaTimes } from 'react-icons/fa';
import { deleteTransaction } from '@/lib/firebase/transactionUtils';

interface Transaction {
  id: string;
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ITA' | 'USA' | 'Nonna' | 'N26' | 'Revolut' | 'PayPal';
  timestamp: number;
  created_at: string;
}

interface TransactionsCurtainProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export default function TransactionsCurtain({ isOpen, onClose, transactions }: TransactionsCurtainProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Sort transactions by timestamp in descending order (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp - a.timestamp);

  const handleDelete = async (transaction: Transaction) => {
    if (isDeleting) return; // Prevent multiple deletes at once
    
    setIsDeleting(transaction.id);
    try {
      const result = await deleteTransaction(transaction);
      if (!result.success) {
        console.error('Failed to delete transaction:', result.error);
        // You might want to show an error toast here
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // You might want to show an error toast here
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 w-[576px] h-full bg-gray-900 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Monthly Transactions</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-y-auto h-[calc(100%-4rem)]">
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-300">Date</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-300">Type</th>
              <th className="py-2 px-4 text-right text-sm font-medium text-gray-300">Amount</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-300">Category</th>
              <th className="py-2 px-4 text-left text-sm font-medium text-gray-300">Method</th>
              <th className="py-2 px-4 text-center text-sm font-medium text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-b border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <td className="py-2 px-4 text-sm">
                  {format(transaction.timestamp, 'MMM d')}
                </td>
                <td className="py-2 px-4 text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      transaction.type === 'expense'
                        ? 'bg-red-900/50 text-red-300'
                        : 'bg-green-900/50 text-green-300'
                    }`}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td className={`py-2 px-4 text-right text-sm ${
                  transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {transaction.amount}€
                </td>
                <td className="py-2 px-4 text-sm">{transaction.category}</td>
                <td className="py-2 px-4 text-sm">{transaction.payment_method}</td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleDelete(transaction)}
                    disabled={isDeleting === transaction.id}
                    className={`p-1.5 rounded-full hover:bg-red-900/50 transition-colors ${
                      isDeleting === transaction.id ? 'opacity-50 cursor-not-allowed' : 'text-red-400 hover:text-red-300'
                    }`}
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 