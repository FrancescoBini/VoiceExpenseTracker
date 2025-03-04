'use client';

import { useState } from 'react';
import { FaBars } from 'react-icons/fa';
import TransactionsCurtain from './TransactionsCurtain';

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

interface MenuButtonProps {
  transactions: Transaction[];
}

export default function MenuButton({ transactions }: MenuButtonProps) {
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsCurtainOpen(true)}
        className="fixed top-4 left-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors z-40"
      >
        <FaBars className="text-xl" />
      </button>

      <TransactionsCurtain
        isOpen={isCurtainOpen}
        onClose={() => setIsCurtainOpen(false)}
        transactions={transactions}
      />
    </>
  );
} 