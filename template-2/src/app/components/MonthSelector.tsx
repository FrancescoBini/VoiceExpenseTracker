import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthSelect: (date: Date) => void;
}

export default function MonthSelector({ selectedMonth, onMonthSelect }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate list of months for 2025
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2025, i);
    return date;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl font-bold hover:text-gray-300 transition-colors"
      >
        {format(selectedMonth, 'MMMM yyyy')}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 -left-20 w-48 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700">
          {months.map((date) => (
            <button
              key={date.getMonth()}
              onClick={() => {
                onMonthSelect(date);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                date.getMonth() === selectedMonth.getMonth() ? 'bg-gray-700' : ''
              }`}
            >
              {format(date, 'MMMM')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 