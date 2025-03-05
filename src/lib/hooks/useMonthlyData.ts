import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { db } from '../firebase/firebase';

interface MonthlyData {
  totals: {
    expenses: number;
    revenue: number;
    net: number;
  };
  categories: {
    Habits: number;
    House: number;
    Travels: number;
    Food: number;
    Investments: number;
    Transport: number;
    Other: number;
  };
  balances: {
    cash: number;
    ita: number;
    usa: number;
    nonna: number;
    n26: number;
    revolut: number;
    paypal: number;
  };
  transactions: Record<string, {
    type: 'expense' | 'revenue';
    amount: number;
    category: string;
    description: string;
    payment_method: string;
    timestamp: number;
    id: string;
    created_at: string;
  }>;
}

export function useMonthlyData() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const monthRef = ref(db, `months/${year}/${month}`);

    // Set up real-time listener
    onValue(monthRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          setMonthlyData(data);
        } else {
          // Initialize with default values if no data exists
          setMonthlyData({
            totals: {
              expenses: 0,
              revenue: 0,
              net: 0
            },
            categories: {
              Habits: 0,
              House: 0,
              Travels: 0,
              Food: 0,
              Investments: 0,
              Transport: 0,
              Other: 0
            },
            balances: {
              cash: 0,
              ita: 0,
              usa: 0,
              nonna: 0,
              n26: 0,
              revolut: 0,
              paypal: 0
            },
            transactions: {}
          });
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    }, (error) => {
      setError(error.message);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      off(monthRef);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return { monthlyData, loading, error };
} 