'use client';

import { useEffect, useRef, useState } from 'react';
import { IconType } from 'react-icons';
import { FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaPlus, FaChartLine } from 'react-icons/fa';
import { updateCategoryTotal, updateMonthlyTotal } from '@/lib/firebase/transactionUtils';
import type { CategoryTotals } from '@/lib/firebase/transactionUtils';

interface Category {
  name: string;
  amount: number;
  color: string;
  icon: IconType;
}

interface ExpenseWheelProps {
  categories: Category[];
  totalExpenses: number;
  totalIncome: number;
  selectedMonth: Date;
  onCategoryUpdate?: (index: number, newAmount: number) => void;
  onTotalUpdate?: (type: 'expenses' | 'revenue', newAmount: number) => void;
}

const defaultCategories: Category[] = [
  { name: 'Casa', amount: 500, color: '#38BDF8', icon: FaHome },
  { name: 'Vizi', amount: 200, color: '#FF0000', icon: FaCocktail },
  { name: 'Viaggi', amount: 300, color: '#3B82F6', icon: FaPlane },
  { name: 'Mezzi', amount: 150, color: '#F97316', icon: FaCar },
  { name: 'Cibo', amount: 400, color: '#a87bc7', icon: FaUtensils },
  { name: 'Altro', amount: 100, color: '#FACC15', icon: FaPlus },
  { name: 'Investimenti', amount: 1000, color: '#22C55E', icon: FaChartLine },
];

export default function ExpenseWheel({
  categories = defaultCategories,
  totalExpenses = 2650,
  totalIncome = 3000,
  selectedMonth = new Date(),
  onCategoryUpdate,
  onTotalUpdate,
}: Partial<ExpenseWheelProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingTotal, setEditingTotal] = useState<'expenses' | 'revenue' | null>(null);
  const [totalEditValue, setTotalEditValue] = useState<string>('');

  // Calculate the actual total expenses from categories
  const calculatedTotalExpenses = categories.reduce((total, category) => {
    // Skip the Investments category as it's not considered an expense
    if (category.name !== 'Investments') {
      return total + category.amount;
    }
    return total;
  }, 0);

  // Use the calculated total or the prop value
  const displayTotalExpenses = calculatedTotalExpenses || totalExpenses;

  const categoryNameMapping: Record<string, keyof CategoryTotals> = {
    'Casa': 'House',
    'Vizi': 'Habits',
    'Viaggi': 'Travels',
    'Mezzi': 'Transport',
    'Cibo': 'Food',
    'Altro': 'Other',
    'Investimenti': 'Investments',
    'House': 'House',
    'Habits': 'Habits',
    'Travels': 'Travels',
    'Transport': 'Transport',
    'Food': 'Food',
    'Other': 'Other',
    'Investments': 'Investments'
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(centerX, centerY) - 10;
    const innerRadius = outerRadius - 30; // Make the ring 30px thick

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel sections
    let startAngle = -Math.PI / 2;
    const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

    categories.forEach(category => {
      const sliceAngle = (2 * Math.PI * category.amount) / total;

      // Draw slice
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + sliceAngle); // Outer arc
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true); // Inner arc
      ctx.closePath();

      ctx.fillStyle = category.color;
      ctx.fill();

      startAngle += sliceAngle;
    });

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
  }, [categories]);

  const handleAmountClick = (index: number) => {
    setEditingIndex(index);
    setEditValue(categories[index].amount.toString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow whole numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setEditValue(value);
  };

  const handleAmountSubmit = async (index: number) => {
    const newAmount = parseInt(editValue);
    console.log('handleAmountSubmit called with index:', index, 'newAmount:', newAmount);
    
    if (!isNaN(newAmount)) {
      const categoryName = categories[index].name;
      const mappedCategory = categoryNameMapping[categoryName];
      console.log('Category name:', categoryName, 'Mapped category:', mappedCategory);
      
      if (mappedCategory) {
        const result = await updateCategoryTotal(mappedCategory, newAmount, selectedMonth);
        console.log('updateCategoryTotal result:', result);
        
        if (result) {
          if (onCategoryUpdate) {
            console.log('Calling onCategoryUpdate with index:', index, 'newAmount:', newAmount);
            onCategoryUpdate(index, newAmount);
          } else {
            console.log('onCategoryUpdate callback is not defined');
          }
          console.log('Category amount updated successfully');
        } else {
          console.error('Failed to update category amount');
        }
      }
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAmountSubmit(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const handleTotalClick = (type: 'expenses' | 'revenue') => {
    setEditingTotal(type);
    setTotalEditValue(type === 'expenses' ? displayTotalExpenses.toString() : totalIncome.toString());
    setEditingIndex(null); // Close any open category edit
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow whole numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setTotalEditValue(value);
  };

  const handleTotalSubmit = async () => {
    const newAmount = parseInt(totalEditValue);
    if (!isNaN(newAmount) && editingTotal) {
      const result = await updateMonthlyTotal(editingTotal, newAmount, selectedMonth);
      if (result) {
        if (onTotalUpdate) {
          onTotalUpdate(editingTotal, newAmount);
        }
        console.log('Total updated successfully');
      } else {
        console.error('Failed to update total');
      }
    }
    setEditingTotal(null);
  };

  const handleTotalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTotalSubmit();
    } else if (e.key === 'Escape') {
      setEditingTotal(null);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Center text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-red-500 text-lg font-medium">
          Expenses:{' '}
          {editingTotal === 'expenses' ? (
            <input
              type="text"
              value={totalEditValue}
              onChange={handleTotalChange}
              onBlur={handleTotalSubmit}
              onKeyDown={handleTotalKeyDown}
              className="bg-gray-700 text-white px-2 py-1 rounded w-24 text-right"
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleTotalClick('expenses')}
              className="hover:text-red-400 transition-colors"
            >
              {displayTotalExpenses}€
            </button>
          )}
        </div>
        <div className="text-green-500 text-lg font-medium">
          Revenue:{' '}
          {editingTotal === 'revenue' ? (
            <input
              type="text"
              value={totalEditValue}
              onChange={handleTotalChange}
              onBlur={handleTotalSubmit}
              onKeyDown={handleTotalKeyDown}
              className="bg-gray-700 text-white px-2 py-1 rounded w-24 text-right"
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleTotalClick('revenue')}
              className="hover:text-green-400 transition-colors"
            >
              {totalIncome}€
            </button>
          )}
        </div>
      </div>

      {/* Category icons and amounts */}
      {categories.map((category, index) => {
        const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
        const radius = 200;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={category.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
            }}
          >
            <div className="flex flex-col items-center bg-gray-800 rounded-lg p-2 shadow-lg">
              {<category.icon className="text-2xl mb-1" style={{ color: category.color }} />}
              <div className="text-sm font-medium">{category.name}</div>
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={handleAmountChange}
                  onBlur={() => handleAmountSubmit(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="bg-gray-700 text-white px-2 py-1 rounded w-20 text-right"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => handleAmountClick(index)}
                  className="text-sm hover:text-gray-300 transition-colors"
                >
                  {category.amount}€
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
} 