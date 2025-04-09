import { useEffect, useState } from 'react';
import { ref, onValue, off, get, set } from 'firebase/database';
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
  networth: {
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

// Default values for a new month
const defaultMonthlyData: MonthlyData = {
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
  networth: {
    cash: 0,
    ita: 0,
    usa: 0,
    nonna: 0,
    n26: 0,
    revolut: 0,
    paypal: 0,
    binance: 0,
    metamask: 0,
    near: 0,
    coinbase: 0,
    venmo: 0,
    robinhood: 0,
    'solana+kresus': 0,
    'terreno indo': 0
  },
  transactions: {}
};

export function useMonthlyData(selectedMonth: Date = new Date()) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData>(defaultMonthlyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based
    
    const monthRef = ref(db, `months/${year}/${month}`);
    setLoading(true);

    // Set up real-time listener
    onValue(monthRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          // Ensure all required properties exist
          const completeData: MonthlyData = {
            totals: {
              expenses: data.totals?.expenses || 0,
              revenue: data.totals?.revenue || 0,
              net: data.totals?.net || 0
            },
            categories: {
              Habits: data.categories?.Habits || 0,
              House: data.categories?.House || 0,
              Travels: data.categories?.Travels || 0,
              Food: data.categories?.Food || 0,
              Investments: data.categories?.Investments || 0,
              Transport: data.categories?.Transport || 0,
              Other: data.categories?.Other || 0
            },
            balances: {
              cash: data.balances?.cash || 0,
              ita: data.balances?.ita || 0,
              usa: data.balances?.usa || 0,
              nonna: data.balances?.nonna || 0,
              n26: data.balances?.n26 || 0,
              revolut: data.balances?.revolut || 0,
              paypal: data.balances?.paypal || 0
            },
            networth: {
              cash: data.networth?.cash || 0,
              ita: data.networth?.ita || 0,
              usa: data.networth?.usa || 0,
              nonna: data.networth?.nonna || 0,
              n26: data.networth?.n26 || 0,
              revolut: data.networth?.revolut || 0,
              paypal: data.networth?.paypal || 0,
              binance: data.networth?.binance || 0,
              metamask: data.networth?.metamask || 0,
              near: data.networth?.near || 0,
              coinbase: data.networth?.coinbase || 0,
              venmo: data.networth?.venmo || 0,
              robinhood: data.networth?.robinhood || 0,
              'solana+kresus': data.networth?.['solana+kresus'] || 0,
              'terreno indo': data.networth?.['terreno indo'] || 0
            },
            transactions: data.transactions || {}
          };
          setMonthlyData(completeData);
        } else {
          // Initialize with default values if no data exists
          setMonthlyData(defaultMonthlyData);
          
          // Create the default data in Firebase for this month
          set(monthRef, defaultMonthlyData)
            .then(() => console.log(`Initialized data for ${year}/${month}`))
            .catch(err => console.error(`Error initializing data for ${year}/${month}:`, err));
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
        // Still set default data even if there's an error
        setMonthlyData(defaultMonthlyData);
      }
    }, (error) => {
      setError(error.message);
      setLoading(false);
      // Still set default data even if there's an error
      setMonthlyData(defaultMonthlyData);
    });

    // Cleanup subscription on unmount
    return () => {
      off(monthRef);
    };
  }, [selectedMonth]); // Update when selectedMonth changes

  return { monthlyData, loading, error, setMonthlyData };
} 