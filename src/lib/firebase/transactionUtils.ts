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

export interface CategoryTotals {
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
    // Create the transaction ID using timestamp and a random suffix for uniqueness
    const transactionId = `${transaction.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Adding transaction with ID: ${transactionId}`);
    
    // 1. Add the transaction to the transactions list
    const transactionRef = ref(db, `months/${year}/${month}/transactions/${transactionId}`);
    await set(transactionRef, {
      ...transaction,
      id: transactionId,
      created_at: now.toISOString()
    });
    console.log('Transaction saved successfully');

    // 2. Update monthly totals
    const monthlyTotalsRef = ref(db, `months/${year}/${month}/totals`);
    const monthlyTotalsSnapshot = await get(monthlyTotalsRef);
    const currentTotals = monthlyTotalsSnapshot.val() as MonthlyTotals || {
      expenses: 0,
      revenue: 0,
      net: 0
    };

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

    // If it's an expense, decrease the balance; if revenue, increase it
    const amountChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    currentBalances[transaction.payment_method.toLowerCase() as keyof Balances] += amountChange;

    await set(balancesRef, currentBalances);
    console.log('Updated balances:', currentBalances);

    return { success: true, transactionId };
  } catch (error) {
    console.error('Error in addTransaction:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateBalance(key: keyof Balances, newBalance: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
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

    currentBalances[key] = newBalance;
    await set(balancesRef, currentBalances);
    console.log('Balance updated successfully:', key, newBalance);
    return { success: true };
  } catch (error) {
    console.error('Error updating balance:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateCategoryTotal(category: keyof CategoryTotals, newAmount: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
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

    currentCategoryTotals[category] = newAmount;
    await set(categoryTotalsRef, currentCategoryTotals);
    console.log('Category total updated successfully:', category, newAmount);
    return { success: true };
  } catch (error) {
    console.error('Error updating category total:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateMonthlyTotal(type: 'expenses' | 'revenue', newAmount: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
    const monthlyTotalsRef = ref(db, `months/${year}/${month}/totals`);
    const monthlyTotalsSnapshot = await get(monthlyTotalsRef);
    const currentTotals = monthlyTotalsSnapshot.val() as MonthlyTotals || {
      expenses: 0,
      revenue: 0,
      net: 0
    };

    // Update the specified total and recalculate net
    currentTotals[type] = newAmount;
    currentTotals.net = currentTotals.revenue - currentTotals.expenses;

    await set(monthlyTotalsRef, currentTotals);
    console.log('Monthly total updated successfully:', type, newAmount);
    return { success: true };
  } catch (error) {
    console.error('Error updating monthly total:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteTransaction(transaction: Transaction) {
  console.log('Starting deleteTransaction with:', transaction);
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  try {
    // 1. Delete the transaction
    const transactionRef = ref(db, `months/${year}/${month}/transactions/${transaction.id}`);
    await set(transactionRef, null);
    console.log('Transaction deleted successfully');

    // 2. Update monthly totals (reverse the transaction effect)
    const monthlyTotalsRef = ref(db, `months/${year}/${month}/totals`);
    const monthlyTotalsSnapshot = await get(monthlyTotalsRef);
    const currentTotals = monthlyTotalsSnapshot.val() as MonthlyTotals || {
      expenses: 0,
      revenue: 0,
      net: 0
    };

    if (transaction.type === 'expense') {
      currentTotals.expenses -= transaction.amount;
      currentTotals.net += transaction.amount;
    } else {
      currentTotals.revenue -= transaction.amount;
      currentTotals.net -= transaction.amount;
    }

    await set(monthlyTotalsRef, currentTotals);
    console.log('Updated monthly totals:', currentTotals);

    // 3. Update category totals (reverse the transaction effect)
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

    if (transaction.type === 'expense') {
      currentCategoryTotals[transaction.category] -= transaction.amount;
    }

    await set(categoryTotalsRef, currentCategoryTotals);
    console.log('Updated category totals:', currentCategoryTotals);

    // 4. Update payment method balances (reverse the transaction effect)
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

    // If it was an expense, increase the balance; if revenue, decrease it
    const amountChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
    currentBalances[transaction.payment_method.toLowerCase() as keyof Balances] += amountChange;

    await set(balancesRef, currentBalances);
    console.log('Updated balances:', currentBalances);

    return { success: true };
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    return { success: false, error: String(error) };
  }
} 