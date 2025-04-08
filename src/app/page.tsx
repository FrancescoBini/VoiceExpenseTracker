'use client';

import { useState } from 'react';
import { FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaChartLine, FaPlus, FaBars } from 'react-icons/fa';
import ExpenseWheel from './components/ExpenseWheel';
import AccountsTable from './components/AccountsTable';
import MonthSelector from './components/MonthSelector';
import MonthlySumUp from './components/MonthlySumUp';
import TransactionsCurtain from './components/TransactionsCurtain';
import { useMonthlyData } from '@/lib/hooks/useMonthlyData';
import NetWorthTable from './components/NetWorthTable';

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
  const { monthlyData, loading, error, setMonthlyData } = useMonthlyData(selectedMonth);
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);

  // Handle month change
  const handleMonthChange = (newMonth: Date) => {
    setSelectedMonth(newMonth);
  };

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
    { name: 'House', amount: monthlyData.categories?.House || 0, color: '#38BDF8', icon: FaHome },
    { name: 'Habits', amount: monthlyData.categories?.Habits || 0, color: '#FF0000', icon: FaCocktail },
    { name: 'Travels', amount: monthlyData.categories?.Travels || 0, color: '#3B82F6', icon: FaPlane },
    { name: 'Transport', amount: monthlyData.categories?.Transport || 0, color: '#F97316', icon: FaCar },
    { name: 'Food', amount: monthlyData.categories?.Food || 0, color: '#a87bc7', icon: FaUtensils },
    { name: 'Investments', amount: monthlyData.categories?.Investments || 0, color: '#22C55E', icon: FaChartLine },
    { name: 'Other', amount: monthlyData.categories?.Other || 0, color: '#FACC15', icon: FaPlus },
  ];

  // Calculate the total expenses from categories (excluding Investments)
  const calculatedTotalExpenses = categories.reduce((total, category) => {
    if (category.name !== 'Investments') {
      return total + category.amount;
    }
    return total;
  }, 0);

  // Calculate investment amount for MonthlySumUp
  const investmentAmount = monthlyData.categories?.Investments || 0;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute left-0">
          <button
            onClick={() => setIsCurtainOpen(true)}
            className="fixed top-4 left-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors z-40"
          >
            <FaBars className="text-xl" />
          </button>
          
          <TransactionsCurtain
            isOpen={isCurtainOpen}
            onClose={() => setIsCurtainOpen(false)}
            transactions={transactionsArray}
            selectedMonth={selectedMonth}
            key={`transactions-${transactionsArray.length}`}
          />
        </div>
        <div className="flex-grow flex justify-center">
          <MonthSelector selectedMonth={selectedMonth} onMonthSelect={handleMonthChange} />
        </div>
        <div className="w-8 invisible"> {/* Invisible spacer for alignment */}
          <button className="p-3">
            <FaBars className="text-xl" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column with net worth table */}
        <div className="lg:col-span-3">
          <NetWorthTable balances={monthlyData.balances || {
            cash: 0,
            ita: 0,
            usa: 0,
            nonna: 0,
            n26: 0,
            revolut: 0,
            paypal: 0
          }} />
        </div>

        {/* Center column with expense wheel */}
        <div className="lg:col-span-6 flex justify-center">
          <ExpenseWheel 
            categories={categories}
            totalExpenses={calculatedTotalExpenses}
            totalIncome={monthlyData.totals?.revenue || 0}
            selectedMonth={selectedMonth}
            onCategoryUpdate={(index, newAmount) => {
              // Create a copy of the monthlyData to update
              const updatedData = { ...monthlyData };
              
              // Ensure categories object exists
              if (!updatedData.categories) {
                updatedData.categories = {
                  Habits: 0,
                  House: 0,
                  Travels: 0,
                  Food: 0,
                  Investments: 0,
                  Transport: 0,
                  Other: 0
                };
              }
              
              // Map the index to the category name
              const categoryName = categories[index].name as keyof typeof updatedData.categories;
              console.log('Updating category:', categoryName, 'with new amount:', newAmount);
              
              // Update the category amount in the local state
              updatedData.categories[categoryName] = newAmount;
              
              // Recalculate the total expenses
              const newTotalExpenses = Object.entries(updatedData.categories)
                .filter(([key]) => key !== 'Investments')
                .reduce((sum, [_, value]) => sum + (value || 0), 0);
              
              // Update the totals
              if (!updatedData.totals) {
                updatedData.totals = {
                  expenses: 0,
                  revenue: 0,
                  net: 0
                };
              }
              
              updatedData.totals.expenses = newTotalExpenses;
              updatedData.totals.net = updatedData.totals.revenue - updatedData.totals.expenses;
              
              // Update the state
              console.log('Setting updated data:', updatedData);
              setMonthlyData(updatedData);
            }}
            onTotalUpdate={(type, newAmount) => {
              // Create a copy of the monthlyData to update
              const updatedData = { ...monthlyData };
              
              // Ensure totals object exists
              if (!updatedData.totals) {
                updatedData.totals = {
                  expenses: 0,
                  revenue: 0,
                  net: 0
                };
              }
              
              // Update the total in the local state
              updatedData.totals[type] = newAmount;
              
              // If updating expenses, distribute the amount proportionally to categories
              if (type === 'expenses') {
                // Get the current total of all categories (excluding Investments)
                const currentCategoriesTotal = Object.entries(updatedData.categories || {})
                  .filter(([key]) => key !== 'Investments')
                  .reduce((sum, [_, value]) => sum + (value || 0), 0);
                
                // If there are existing categories with values
                if (currentCategoriesTotal > 0) {
                  // Calculate the ratio for distribution
                  const ratio = newAmount / currentCategoriesTotal;
                  
                  // Distribute the new total proportionally
                  Object.entries(updatedData.categories || {}).forEach(([key, value]) => {
                    if (key !== 'Investments' && value > 0) {
                      updatedData.categories[key as keyof typeof updatedData.categories] = Math.round(value * ratio);
                    }
                  });
                }
              }
              
              // Recalculate net
              updatedData.totals.net = updatedData.totals.revenue - updatedData.totals.expenses;
              
              // Update the state
              setMonthlyData(updatedData);
            }}
          />
        </div>

        {/* Right column with tables */}
        <div className="lg:col-span-3 space-y-8">
          <AccountsTable balances={monthlyData.balances || {
            cash: 0,
            ita: 0,
            usa: 0,
            nonna: 0,
            n26: 0,
            revolut: 0,
            paypal: 0
          }} selectedMonth={selectedMonth} />
          <MonthlySumUp
            totalExpenses={calculatedTotalExpenses}
            totalRevenue={monthlyData.totals?.revenue || 0}
            investmentAmount={investmentAmount}
          />
        </div>
      </div>
    </main>
  );
}
