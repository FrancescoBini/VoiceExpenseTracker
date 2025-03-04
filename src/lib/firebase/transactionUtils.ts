import { ref, get, set, update } from 'firebase/database';
import { db } from './firebase';

interface Transaction {
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ITA' | 'USA' | 'Nonna' | 'N26' | 'Revolut' | 'PayPal';
  timestamp: number;
}

interface MonthlyTotals {
  expenses: number;
  revenue: number;
  net: number;
}

interface CategoryTotals {
  Habits: number;
  House: number;
  Travels: number;
  Food: number;
  Investments: number;
  Transport: number;
  Other: number;
}

interface Balances {
  cash: number;
  ITA: number;
  USA: number;
  Nonna: number;
  N26: number;
  Revolut: number;
  PayPal: number;
}

export async function addTransaction(transaction: Transaction) {
  console.log('Starting addTransaction with:', transaction);
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based

  try {
    console.log(`Adding transaction to path: months/${year}/${month}/transactions/${transaction.timestamp}`);
    
    // 1. Add the transaction to the transactions list
    const transactionRef = ref(db, `months/${year}/${month}/transactions/${transaction.timestamp}`);
    await set(transactionRef, transaction);
    console.log('Transaction saved successfully');

    // 2. Update monthly totals
    const monthlyTotalsRef = ref(db, `months/${year}/${month}/totals`);
    const monthlyTotalsSnapshot = await get(monthlyTotalsRef);
    const currentTotals = monthlyTotalsSnapshot.val() as MonthlyTotals || {
      expenses: 0,
      revenue: 0,
      net: 0
    };
    console.log('Current monthly totals:', currentTotals);

    if (transaction.type === 'expense') {
      currentTotals.expenses += transaction.amount;
      currentTotals.net -= transaction.amount;
    } else {
      currentTotals.revenue += transaction.amount;
      currentTotals.net += transaction.amount;
    }

    await set(monthlyTotalsRef, currentTotals);
    console.log('Updated monthly totals:', currentTotals);

    // 3. Update category totals
    const categoryTotalsRef = ref(db, `months/${year}/${month}/categories`);
    const categoryTotalsSnapshot = await get(categoryTotalsRef);
    const currentCategoryTotals = categoryTotalsSnapshot.val() as CategoryTotals || {
      Habits: 0,
      House: 0,
      Travels: 0,
      Food: 0,
      Investments: 0,
      Transport: 0,
      Other: 0
    };
    console.log('Current category totals:', currentCategoryTotals);

    if (transaction.type === 'expense') {
      currentCategoryTotals[transaction.category] += transaction.amount;
    }

    await set(categoryTotalsRef, currentCategoryTotals);
    console.log('Updated category totals:', currentCategoryTotals);

    // 4. Update payment method balances
    const balancesRef = ref(db, `months/${year}/${month}/balances`);
    const balancesSnapshot = await get(balancesRef);
    const currentBalances = balancesSnapshot.val() as Balances || {
      cash: 0,
      ITA: 0,
      USA: 0,
      Nonna: 0,
      N26: 0,
      Revolut: 0,
      PayPal: 0
    };
    console.log('Current balances:', currentBalances);

    // If it's an expense, decrease the balance; if revenue, increase it
    const amountChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    currentBalances[transaction.payment_method.toLowerCase() as keyof Balances] += amountChange;

    await set(balancesRef, currentBalances);
    console.log('Updated balances:', currentBalances);

    return { success: true };
  } catch (error) {
    console.error('Error in addTransaction:', error);
    return { success: false, error: String(error) };
  }
} 