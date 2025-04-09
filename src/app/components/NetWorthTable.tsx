'use client';

import { useState } from 'react';
import { updateBalance, updateNetWorth } from '@/lib/firebase/transactionUtils';

interface NetWorthBalances {
  cash: number;
  ita: number;
  usa: number;
  nonna: number;
  n26: number;
  revolut: number;
  paypal: number;
  binance: number;
  metamask: number;
  near: number;
  coinbase: number;
  venmo: number;
  robinhood: number;
  'solana+kresus': number;
  'terreno indo': number;
}

interface NetWorthTableProps {
  balances: {
    cash: number;
    ita: number;
    usa: number;
    nonna: number;
    n26: number;
    revolut: number;
    paypal: number;
  };
  networth?: Partial<NetWorthBalances>;
  selectedMonth: Date;
}

// List of keys that are shared with the balances table
const SHARED_KEYS = ['cash', 'ita', 'usa', 'nonna', 'n26', 'revolut', 'paypal'] as const;
type SharedKey = typeof SHARED_KEYS[number];

export default function NetWorthTable({ balances, networth = {}, selectedMonth }: NetWorthTableProps) {
  const [editingKey, setEditingKey] = useState<keyof NetWorthBalances | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Initialize full net worth object with balances from props and networth values
  const netWorthBalances: NetWorthBalances = {
    // First 7 values come from balances
    cash: balances.cash,
    ita: balances.ita,
    usa: balances.usa,
    nonna: balances.nonna,
    n26: balances.n26,
    revolut: balances.revolut,
    paypal: balances.paypal,
    // Rest come from networth, defaulting to 0 if not present
    binance: networth.binance || 0,
    metamask: networth.metamask || 0,
    near: networth.near || 0,
    coinbase: networth.coinbase || 0,
    venmo: networth.venmo || 0,
    robinhood: networth.robinhood || 0,
    'solana+kresus': networth['solana+kresus'] || 0,
    'terreno indo': networth['terreno indo'] || 0,
  };

  const handleBalanceClick = (key: keyof NetWorthBalances) => {
    setEditingKey(key);
    setEditValue(netWorthBalances[key].toString());
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal points
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setEditValue(value);
  };

  const handleBalanceSubmit = async (key: keyof NetWorthBalances) => {
    const newBalance = parseFloat(editValue);
    if (!isNaN(newBalance)) {
      // If the key is shared with balances table, update it there too
      if (SHARED_KEYS.includes(key as SharedKey)) {
        const result = await updateBalance(key as SharedKey, newBalance, selectedMonth);
        if (!result) {
          console.error('Failed to update balance');
        }
      } else {
        const result = await updateNetWorth(key, newBalance, selectedMonth);
        if (!result) {
          console.error('Failed to update net worth');
        }
      }
    }
    setEditingKey(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, key: keyof NetWorthBalances) => {
    if (e.key === 'Enter') {
      handleBalanceSubmit(key);
    } else if (e.key === 'Escape') {
      setEditingKey(null);
    }
  };

  // Calculate total net worth
  const totalNetWorth = Object.values(netWorthBalances).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium text-center mb-4">Net Worth</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 pr-2">
        <table className="w-full">
          <tbody>
            {(Object.entries(netWorthBalances) as [keyof NetWorthBalances, number][]).map(([key, balance]) => (
              <tr key={key} className="border-b border-gray-700 last:border-0">
                <td className="py-1.5 text-gray-300">{key}</td>
                <td className="py-1.5 text-right pr-2">
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
            {/* Total row */}
            <tr className="border-t-2 border-gray-600 sticky bottom-0 bg-gray-800">
              <td className="py-2 text-gray-300 font-bold">Total</td>
              <td className="py-2 text-right pr-2">
                <span className="text-gray-300 font-bold">{totalNetWorth}€</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 