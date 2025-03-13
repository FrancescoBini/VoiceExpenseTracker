'use client';

import React from 'react';

interface NetWorthData {
  [key: string]: number;
}

interface Balances {
  cash: number;
  ita: number;
  usa: number;
  nonna: number;
  n26: number;
  revolut: number;
  paypal: number;
}

interface NetWorthTableProps {
  data?: NetWorthData;
  balances?: Balances;
}

export default function NetWorthTable({ data, balances }: NetWorthTableProps) {
  // Default data from the image if none is provided
  const defaultData: NetWorthData = {
    'binance': 1491,
    'nft': 0,
    'metamask': 1379,
    'near': 150,
    'coinbase': 7,
    'venmo': 0,
    'robinhood': 7432,
    'solana+kresus': 1391,
    'dollar': 57,
    'indonesia': 5127,
  };

  // Use provided data or default data for non-balance accounts
  const netWorthData = data || defaultData;

  // Create ordered data with balances first
  const orderedData: Record<string, number> = {};
  
  // Add balances first (if provided)
  if (balances) {
    orderedData['cash'] = balances.cash;
    orderedData['ita'] = balances.ita;
    orderedData['usa'] = balances.usa;
    orderedData['nonna'] = balances.nonna;
    orderedData['n26'] = balances.n26;
    orderedData['revolut'] = balances.revolut;
    orderedData['paypal'] = balances.paypal;
  } else {
    // Use default values if balances not provided
    orderedData['cash'] = 0;
    orderedData['ita'] = 0;
    orderedData['usa'] = 0;
    orderedData['nonna'] = 0;
    orderedData['n26'] = 979; // From the image
    orderedData['revolut'] = 3340; // From the image
    orderedData['paypal'] = 333; // From the image
  }

  // Add the rest of the data
  Object.entries(netWorthData).forEach(([key, value]) => {
    // Skip 'Euro' entry
    if (key.toLowerCase() !== 'euro') {
      orderedData[key] = value;
    }
  });

  // Calculate total net worth
  const totalNetWorth = Object.values(orderedData).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-3 shadow-lg">
      <h2 className="text-sm font-medium text-center mb-2">Net Worth</h2>
      <div>
        <table className="w-full text-xs">
          <tbody>
            {Object.entries(orderedData).map(([account, amount]) => (
              <tr key={account} className="border-b border-gray-700 last:border-0">
                <td className="py-1 text-gray-300">{account}</td>
                <td className="py-1 text-right text-gray-300">
                  {amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t-2 border-gray-600 mt-1 pt-1">
        <div className="flex justify-between text-sm">
          <span className="font-bold text-white">Total</span>
          <span className="font-bold text-white">{totalNetWorth}</span>
        </div>
      </div>
    </div>
  );
} 