'use client';

import { useState } from 'react';
import { FaBars, FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaPlus, FaChartLine } from 'react-icons/fa';
import ExpenseWheel from './components/ExpenseWheel';
import AccountsTable from './components/AccountsTable';
import MonthSelector from './components/MonthSelector';

// Example monthly data structure
const monthlyData = {
  '2025-03': {
    categories: [
      { name: 'Casa', amount: 500, color: '#38BDF8', icon: FaHome },
      { name: 'Vizi', amount: 200, color: '#EF4444', icon: FaCocktail },
      { name: 'Viaggi', amount: 300, color: '#3B82F6', icon: FaPlane },
      { name: 'Mezzi', amount: 150, color: '#F97316', icon: FaCar },
      { name: 'Cibo', amount: 400, color: '#a87bc7', icon: FaUtensils },
      { name: 'Altro', amount: 100, color: '#FACC15', icon: FaPlus },
      { name: 'Investimenti', amount: 1000, color: '#22C55E', icon: FaChartLine },
    ],
    totalExpenses: 2650,
    totalIncome: 3000,
  },
  // Add more months as needed
};

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2025, 2)); // March 2025

  // Get data for the selected month
  const getMonthData = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthlyData[key as keyof typeof monthlyData] || {
      categories: [],
      totalExpenses: 0,
      totalIncome: 0,
    };
  };

  const currentMonthData = getMonthData(selectedMonth);

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button className="text-2xl hover:text-gray-300 transition-colors">
          <FaBars />
        </button>
        <MonthSelector selectedMonth={selectedMonth} onMonthSelect={setSelectedMonth} />
        <div className="w-8" /> {/* Spacer for alignment */}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Expense Wheel */}
        <div className="lg:col-span-3">
          <ExpenseWheel 
            categories={currentMonthData.categories}
            totalExpenses={currentMonthData.totalExpenses}
            totalIncome={currentMonthData.totalIncome}
          />
        </div>

        {/* Accounts Table */}
        <div className="lg:col-span-1">
          <AccountsTable />
        </div>
      </div>
    </main>
  );
}
