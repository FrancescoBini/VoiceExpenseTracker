'use client';

import { useMonthlyData } from '@/lib/hooks/useMonthlyData';

export default function Home() {
  const { monthlyData, loading, error } = useMonthlyData();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!monthlyData) {
    return <div className="flex items-center justify-center min-h-screen">No data available</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">
        {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}
      </h1>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Expenses</h2>
          <p className="text-2xl text-red-500">{monthlyData.totals.expenses}€</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Revenue</h2>
          <p className="text-2xl text-green-500">{monthlyData.totals.revenue}€</p>
        </div>
        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Net</h2>
          <p className={`text-2xl ${monthlyData.totals.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {monthlyData.totals.net}€
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Categories</h2>
          <div className="space-y-4">
            {Object.entries(monthlyData.categories).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-medium">{category}</span>
                <span className="text-gray-600">{amount}€</span>
              </div>
            ))}
          </div>
        </div>

        {/* Balances */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Balances</h2>
          <div className="space-y-4">
            {Object.entries(monthlyData.balances).map(([method, balance]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="font-medium">{method.toUpperCase()}</span>
                <span className={`${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {balance}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {Object.entries(monthlyData.transactions || {}).reverse().map(([id, transaction]) => (
            <div key={id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-sm text-gray-500">
                  {transaction.category} • {transaction.payment_method}
                </p>
              </div>
              <span className={`font-medium ${
                transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'
              }`}>
                {transaction.type === 'expense' ? '-' : '+'}
                {transaction.amount}€
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
