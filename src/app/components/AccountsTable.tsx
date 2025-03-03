'use client';

import { useState } from 'react';

interface Account {
  name: string;
  balance: number;
}

interface AccountsTableProps {
  accounts?: Account[];
}

const defaultAccounts: Account[] = [
  { name: 'Cash', balance: 1250 },
  { name: 'ITA', balance: 15780 },
  { name: 'USA', balance: 8450 },
  { name: 'Nonna', balance: 2500 },
  { name: 'N26', balance: 3600 },
  { name: 'Revolut', balance: 3450 },
  { name: 'PayPal', balance: 780 },
];

export default function AccountsTable({ accounts = defaultAccounts }: AccountsTableProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [accountsState, setAccountsState] = useState<Account[]>(accounts);
  const [editValue, setEditValue] = useState<string>('');

  const handleBalanceClick = (index: number) => {
    setEditingIndex(index);
    setEditValue(accountsState[index].balance.toString());
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow whole numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setEditValue(value);
  };

  const handleBalanceSubmit = (index: number) => {
    const newBalance = parseInt(editValue);
    if (!isNaN(newBalance)) {
      const newAccounts = [...accountsState];
      newAccounts[index].balance = newBalance;
      setAccountsState(newAccounts);
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleBalanceSubmit(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium text-center mb-4">Balances Table</h2>
      <table className="w-full">
        <tbody>
          {accountsState.map((account, index) => (
            <tr key={account.name} className="border-b border-gray-700 last:border-0">
              <td className="py-2 text-gray-300">{account.name}</td>
              <td className="py-2 text-right">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={handleBalanceChange}
                    onBlur={() => handleBalanceSubmit(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="bg-gray-700 text-white px-2 py-1 rounded w-24 text-right"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleBalanceClick(index)}
                    className="text-gray-300 hover:text-white transition-colors focus:outline-none"
                  >
                    {account.balance}€
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