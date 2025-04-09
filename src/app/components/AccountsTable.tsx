'use client';

import { useState } from 'react';
import { updateBalance, copyBalancesToNextMonth } from '@/lib/firebase/transactionUtils';

interface Balances {
  cash: number;
  ita: number;
  usa: number;
  nonna: number;
  n26: number;
  revolut: number;
  paypal: number;
}

interface AccountsTableProps {
  balances: Balances;
  selectedMonth: Date;
}

export default function AccountsTable({ balances, selectedMonth }: AccountsTableProps) {
  const [editingKey, setEditingKey] = useState<keyof Balances | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isCopying, setIsCopying] = useState(false);

  const handleBalanceClick = (key: keyof Balances) => {
    setEditingKey(key);
    setEditValue(balances[key].toString());
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setEditValue(value);
  };

  const handleBalanceSubmit = async (key: keyof Balances) => {
    const newBalance = parseFloat(editValue);
    if (!isNaN(newBalance)) {
      const result = await updateBalance(key, newBalance, selectedMonth);
      if (result) {
        // The balance will be updated through the real-time listener
        console.log('Balance updated successfully');
      } else {
        console.error('Failed to update balance');
      }
    }
    setEditingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof Balances) => {
    if (e.key === 'Enter') {
      handleBalanceSubmit(key);
    } else if (e.key === 'Escape') {
      setEditingKey(null);
    }
  };

  const handleCopyToNextMonth = async () => {
    setIsCopying(true);
    try {
      const result = await copyBalancesToNextMonth(selectedMonth);
      if (result) {
        console.log('Successfully copied balances to next month');
      } else {
        console.error('Failed to copy balances to next month');
      }
    } catch (error) {
      console.error('Error copying balances:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Balances Table</h2>
        <button
          onClick={handleCopyToNextMonth}
          disabled={isCopying}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm rounded transition-colors"
        >
          {isCopying ? 'Copying...' : 'Copy to Next Month'}
        </button>
      </div>
      <table className="w-full">
        <tbody>
          {(Object.entries(balances) as [keyof Balances, number][]).map(([key, balance]) => (
            <tr key={key} className="border-b border-gray-700 last:border-0">
              <td className="py-2 text-gray-300">{key}</td>
              <td className="py-2 text-right">
                {editingKey === key ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleBalanceChange}
                    onBlur={() => handleBalanceSubmit(key)}
                    onKeyDown={(e) => handleKeyDown(e, key)}
                    className="bg-gray-700 text-white px-2 py-1 rounded w-24 text-right"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleBalanceClick(key)}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none"
                  >
                    {balance}€
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 