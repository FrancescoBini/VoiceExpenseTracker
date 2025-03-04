'use client';

import { useState } from 'react';

interface Balances {
  cash: number;
  ITA: number;
  USA: number;
  Nonna: number;
  N26: number;
  Revolut: number;
  PayPal: number;
}

interface AccountsTableProps {
  balances: Balances;
}

export default function AccountsTable({ balances }: AccountsTableProps) {
  const [editingKey, setEditingKey] = useState<keyof Balances | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleBalanceClick = (key: keyof Balances) => {
    setEditingKey(key);
    setEditValue(balances[key].toString());
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setEditValue(value);
  };

  const handleBalanceSubmit = (key: keyof Balances) => {
    const newBalance = parseFloat(editValue);
    if (!isNaN(newBalance)) {
      // TODO: Add Firebase update logic here when needed
      console.log('Update balance:', key, newBalance);
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

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium text-center mb-4">Balances Table</h2>
      <table className="w-full">
        <tbody>
          {(Object.entries(balances) as [keyof Balances, number][]).map(([key, balance]) => (
            <tr key={key} className="border-b border-gray-700 last:border-0">
              <td className="py-2 text-gray-300">{key.toUpperCase()}</td>
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