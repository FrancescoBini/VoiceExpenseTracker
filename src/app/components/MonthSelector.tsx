import { useState, useRef, useEffect } from 'react';
import { format, addYears, subYears } from 'date-fns';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthSelect: (date: Date) => void;
}

export default function MonthSelector({ selectedMonth, onMonthSelect }: MonthSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(selectedMonth.getFullYear());
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

  // Generate list of months for the current year
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(currentYear, i);
    return date;
  });

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-2xl font-bold hover:text-gray-300 transition-colors text-center"
        aria-label="Select month"
      >
        {format(selectedMonth, 'MMMM yyyy')}
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 left-1/2 transform -translate-x-1/2 w-64 bg-gray-800 rounded-lg shadow-lg py-1 border border-gray-700">
          {/* Year selector */}
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-700">
            <button 
              onClick={handlePreviousYear}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Previous year"
            >
              <FaChevronLeft />
            </button>
            <span className="font-medium">{currentYear}</span>
            <button 
              onClick={handleNextYear}
              className="p-1 hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Next year"
            >
              <FaChevronRight />
            </button>
          </div>
          
          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1 p-2">
            {months.map((date) => (
              <button
                key={date.getMonth()}
                onClick={() => {
                  onMonthSelect(date);
                  setIsOpen(false);
                }}
                className={`px-2 py-1 rounded hover:bg-gray-700 transition-colors ${
                  date.getMonth() === selectedMonth.getMonth() && 
                  date.getFullYear() === selectedMonth.getFullYear() 
                    ? 'bg-gray-700 font-medium' 
                    : ''
                }`}
              >
                {format(date, 'MMM')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 