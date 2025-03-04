'use client';

import { useState, useEffect } from 'react';
import { FaBars, FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaChartLine, FaPlus } from 'react-icons/fa';
import ExpenseWheel from './components/ExpenseWheel';
import AccountsTable from './components/AccountsTable';
import MonthSelector from './components/MonthSelector';
import MonthlySumUp from './components/MonthlySumUp';

// Example monthly data structure
const defaultMonthlyData = {
  '2025-03': {
    categories: [
      { name: 'House', amount: 500, color: '#38BDF8', icon: FaHome },
      { name: 'Habits', amount: 200, color: '#FF0000', icon: FaCocktail },
      { name: 'Travels', amount: 300, color: '#3B82F6', icon: FaPlane },
      { name: 'Transport', amount: 150, color: '#F97316', icon: FaCar },
      { name: 'Food', amount: 400, color: '#a87bc7', icon: FaUtensils },
      { name: 'Investments', amount: 1000, color: '#22C55E', icon: FaChartLine },
      { name: 'Other', amount: 100, color: '#FACC15', icon: FaPlus },
    ],
    totalExpenses: 2650,
    totalIncome: 3000,
  },
  // Add more months as needed
};

// Helper function to serialize icons for localStorage
const serializeData = (data: typeof defaultMonthlyData) => {
  return JSON.stringify(data, (key, value) => {
    if (key === 'icon') {
      // Store the icon name instead of the function
      return value.name;
    }
    return value;
  });
};

// Helper function to deserialize icons from localStorage
const deserializeData = (jsonString: string): typeof defaultMonthlyData => {
  const iconMap = {
    FaHome,
    FaCocktail,
    FaPlane,
    FaCar,
    FaUtensils,
    FaChartLine,
    FaPlus,
  };

  return JSON.parse(jsonString, (key, value) => {
    if (key === 'icon' && typeof value === 'string') {
      // Convert icon name back to the icon component
      return iconMap[value as keyof typeof iconMap];
    }
    return value;
  });
};

export default function Home() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date(2025, 2)); // March 2025
  const [monthlyDataState, setMonthlyDataState] = useState(defaultMonthlyData);

  // Load data from localStorage on initial render
  useEffect(() => {
    localStorage.clear(); // Clear all stored data to force new defaults
    const savedData = localStorage.getItem('monthlyData');
    if (savedData) {
      try {
        const parsedData = deserializeData(savedData);
        setMonthlyDataState(parsedData);
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    }
  }, []);

  // Get data for the selected month
  const getMonthData = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return monthlyDataState[key as keyof typeof monthlyDataState] || {
      categories: [
        { name: 'House', amount: 0, color: '#38BDF8', icon: FaHome },
        { name: 'Habits', amount: 0, color: '#FF0000', icon: FaCocktail },
        { name: 'Travels', amount: 0, color: '#3B82F6', icon: FaPlane },
        { name: 'Transport', amount: 0, color: '#F97316', icon: FaCar },
        { name: 'Food', amount: 0, color: '#a87bc7', icon: FaUtensils },
        { name: 'Investments', amount: 0, color: '#22C55E', icon: FaChartLine },
        { name: 'Other', amount: 0, color: '#FACC15', icon: FaPlus },
      ],
      totalExpenses: 0,
      totalIncome: 0,
    };
  };

  const currentMonthData = getMonthData(selectedMonth);
  
  // Calculate investment amount
  const investmentAmount = currentMonthData.categories.find(cat => cat.name === 'Investments')?.amount || 0;

  const handleCategoryUpdate = (index: number, newAmount: number) => {
    const key = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    const updatedData = { ...monthlyDataState };
    
    // Get current month data or create new data if it doesn't exist
    const currentData = updatedData[key as keyof typeof monthlyDataState] || getMonthData(selectedMonth);
    const categories = [...currentData.categories];
    categories[index] = { ...categories[index], amount: newAmount };
    
    // Recalculate total expenses
    const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0);
    
    updatedData[key as keyof typeof monthlyDataState] = {
      ...currentData,
      categories,
      totalExpenses,
    };
    
    setMonthlyDataState(updatedData);
    
    // Save to localStorage
    localStorage.setItem('monthlyData', serializeData(updatedData));
  };

  const handleTotalUpdate = (type: 'expenses' | 'revenue', newAmount: number) => {
    const key = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
    const updatedData = { ...monthlyDataState };
    
    // Get current month data or create new data if it doesn't exist
    const currentData = updatedData[key as keyof typeof monthlyDataState] || getMonthData(selectedMonth);
    
    updatedData[key as keyof typeof monthlyDataState] = {
      ...currentData,
      [type === 'expenses' ? 'totalExpenses' : 'totalIncome']: newAmount,
    };
    
    setMonthlyDataState(updatedData);
    
    // Save to localStorage
    localStorage.setItem('monthlyData', serializeData(updatedData));
  };

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
            onCategoryUpdate={handleCategoryUpdate}
            onTotalUpdate={handleTotalUpdate}
          />
        </div>

        {/* Right column with tables */}
        <div className="lg:col-span-1 space-y-8">
          <AccountsTable />
          <MonthlySumUp
            totalExpenses={currentMonthData.totalExpenses}
            totalRevenue={currentMonthData.totalIncome}
            investmentAmount={investmentAmount}
          />
        </div>
      </div>
    </main>
  );
}
