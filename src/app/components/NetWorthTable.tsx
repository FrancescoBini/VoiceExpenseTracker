'use client';

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
}

export default function NetWorthTable({ balances }: NetWorthTableProps) {
  // Initialize full net worth object with balances from props and 0 for other entries
  const netWorthBalances: NetWorthBalances = {
    cash: balances.cash,
    ita: balances.ita,
    usa: balances.usa,
    nonna: balances.nonna,
    n26: balances.n26,
    revolut: balances.revolut,
    paypal: balances.paypal,
    binance: 0,
    metamask: 0,
    near: 0,
    coinbase: 0,
    venmo: 0,
    robinhood: 0,
    'solana+kresus': 0,
    'terreno indo': 0,
  };

  // Calculate total net worth
  const totalNetWorth = Object.values(netWorthBalances).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-lg font-medium text-center mb-4">Net Worth</h2>
      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        <table className="w-full">
          <tbody>
            {(Object.entries(netWorthBalances) as [keyof NetWorthBalances, number][]).map(([key, balance]) => (
              <tr key={key} className="border-b border-gray-700 last:border-0">
                <td className="py-1.5 text-gray-300">{key}</td>
                <td className="py-1.5 text-right">
                  <span className="text-gray-300">{balance}€</span>
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="border-t-2 border-gray-600 sticky bottom-0 bg-gray-800">
              <td className="py-2 text-gray-300 font-bold">Total</td>
              <td className="py-2 text-right">
                <span className="text-gray-300 font-bold">{totalNetWorth}€</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 