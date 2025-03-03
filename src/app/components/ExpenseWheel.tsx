'use client';

import { useEffect, useRef } from 'react';
import { IconType } from 'react-icons';
import { FaHome, FaCocktail, FaPlane, FaCar, FaUtensils, FaPlus, FaChartLine } from 'react-icons/fa';

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
}

const defaultCategories: Category[] = [
  { name: 'Casa', amount: 500, color: '#38BDF8', icon: FaHome },
  { name: 'Vizi', amount: 200, color: '#EF4444', icon: FaCocktail },
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
}: Partial<ExpenseWheelProps>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {/* Center text */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-red-500 text-lg font-medium">Spese: {totalExpenses}€</div>
        <div className="text-green-500 text-lg font-medium">Fatturato: {totalIncome}€</div>
      </div>

      {/* Category icons and amounts */}
      {categories.map((category, index) => {
        const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
        const radius = 200; // Increased radius to position icons outside the wheel
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
              <div className="text-sm">{category.amount}€</div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 