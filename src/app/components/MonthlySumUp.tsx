'use client';

import { useMemo } from 'react';

interface MonthlySumUpProps {
  totalExpenses: number;
  totalRevenue: number;
  investmentAmount: number;
}

export default function MonthlySumUp({
  totalExpenses,
  totalRevenue,
  investmentAmount,
}: MonthlySumUpProps) {
  const expNoInv = useMemo(() => totalExpenses - investmentAmount, [totalExpenses, investmentAmount]);
  const net = useMemo(() => totalRevenue - expNoInv, [totalRevenue, expNoInv]);

  const rows = [
    { name: 'Expenses', amount: totalExpenses },
    { name: 'Revenue', amount: totalRevenue },
    { name: 'Exp No Inv', amount: expNoInv },
    { name: 'Net', amount: net, showSign: true },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium text-center mb-4">Monthly SumUp</h2>
      <table className="w-full">
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-gray-700 last:border-0">
              <td className="py-2 text-gray-300">{row.name}</td>
              <td className="py-2 text-right">
                <span className="text-gray-300">
                  {row.showSign ? (row.amount >= 0 ? '+' : '') : ''}{row.amount}€
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 