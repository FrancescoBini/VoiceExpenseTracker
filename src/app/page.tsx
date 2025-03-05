'use client';

import { useState } from 'react';
import { FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaChartLine, FaPlus } from 'react-icons/fa';
import ExpenseWheel from './components/ExpenseWheel';
import AccountsTable from './components/AccountsTable';
import MonthSelector from './components/MonthSelector';
import MonthlySumUp from './components/MonthlySumUp';
import MenuButton from './components/MenuButton';
import { useMonthlyData } from '@/lib/hooks/useMonthlyData';

// Define Transaction type to match the one in other components
interface Transaction {
  id: string;
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ita' | 'usa' | 'nonna' | 'n26' | 'revolut' | 'paypal';
  timestamp: number;
  created_at: string;
}

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2025, 2)); // March 2025
  const { monthlyData, loading, error } = useMonthlyData();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-red-500">Error: {error}</div>;
  }

  if (!monthlyData) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">No data available</div>;
  }

  // Transform transactions from Record to Array
  const transactionsArray = Object.entries(monthlyData.transactions || {}).map(([_, transaction]) => ({
    ...transaction,
    category: transaction.category as 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other',
    payment_method: transaction.payment_method as 'cash' | 'ita' | 'usa' | 'nonna' | 'n26' | 'revolut' | 'paypal'
  }));

  // Map Firebase data to the format expected by ExpenseWheel
  const categories = [
    { name: 'House', amount: monthlyData.categories.House || 0, color: '#38BDF8', icon: FaHome },
    { name: 'Habits', amount: monthlyData.categories.Habits || 0, color: '#FF0000', icon: FaCocktail },
    { name: 'Travels', amount: monthlyData.categories.Travels || 0, color: '#3B82F6', icon: FaPlane },
    { name: 'Transport', amount: monthlyData.categories.Transport || 0, color: '#F97316', icon: FaCar },
    { name: 'Food', amount: monthlyData.categories.Food || 0, color: '#a87bc7', icon: FaUtensils },
    { name: 'Investments', amount: monthlyData.categories.Investments || 0, color: '#22C55E', icon: FaChartLine },
    { name: 'Other', amount: monthlyData.categories.Other || 0, color: '#FACC15', icon: FaPlus },
  ];

  // Calculate investment amount for MonthlySumUp
  const investmentAmount = monthlyData.categories.Investments || 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <MenuButton transactions={transactionsArray} />
        <MonthSelector selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />
        <div className="w-8" /> {/* Spacer for alignment */}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Expense Wheel */}
        <div className="lg:col-span-3">
          <ExpenseWheel 
            categories={categories}
            totalExpenses={monthlyData.totals.expenses}
            totalIncome={monthlyData.totals.revenue}
          />
        </div>

        {/* Right column with tables */}
        <div className="lg:col-span-1 space-y-8">
          <AccountsTable balances={monthlyData.balances} />
          <MonthlySumUp
            totalExpenses={monthlyData.totals.expenses}
            totalRevenue={monthlyData.totals.revenue}
            investmentAmount={investmentAmount}
          />
        </div>
      </div>
    </main>
  );
}
