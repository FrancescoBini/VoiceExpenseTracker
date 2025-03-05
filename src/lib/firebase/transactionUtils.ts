import { ref, get, set, update } from 'firebase/database';
import { db } from './firebase';

// Base transaction type without id and created_at
interface BaseTransaction {
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ita' | 'usa' | 'nonna' | 'n26' | 'revolut' | 'paypal';
  timestamp: number;
}

// Full transaction type with id and created_at
interface Transaction extends BaseTransaction {
  id: string;
  created_at: string;
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
  ita: number;
  usa: number;
  nonna: number;
  n26: number;
  revolut: number;
  paypal: number;
}

export async function addTransaction(transaction: BaseTransaction, selectedMonth: Date = new Date()) {
  console.log('Starting addTransaction with:', transaction);
  
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based

  try {
    // Create the transaction ID using timestamp and a random suffix for uniqueness
    const transactionId = `${transaction.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Adding transaction with ID: ${transactionId}`);
    
    // Create the full transaction object
    const fullTransaction: Transaction = {
      ...transaction,
      id: transactionId,
      created_at: new Date().toISOString()
    };
    
    // 1. Add the transaction to the transactions list
    const transactionRef = ref(db, `months/${year}/${month}/transactions/${transactionId}`);
    await set(transactionRef, fullTransaction);
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

    // Recalculate the total expenses from categories (excluding Investments)
    if (transaction.type === 'expense') {
      const totalExpenses = Object.entries(currentCategoryTotals)
        .filter(([key]) => key !== 'Investments')
        .reduce((sum, [_, value]) => sum + (value > 0 ? value : 0), 0);
      
      // Update the expenses total to match the sum of categories
      currentTotals.expenses = totalExpenses;
      currentTotals.net = currentTotals.revenue - currentTotals.expenses;
      
      await set(monthlyTotalsRef, currentTotals);
      console.log('Recalculated and updated monthly totals:', currentTotals);
    }

    // 4. Update payment method balances
    const balancesRef = ref(db, `months/${year}/${month}/balances`);
    const balancesSnapshot = await get(balancesRef);
    const currentBalances = balancesSnapshot.val() as Balances || {
      cash: 0,
      ita: 0,
      usa: 0,
      nonna: 0,
      n26: 0,
      revolut: 0,
      paypal: 0
    };

    // If it's an expense, decrease the balance; if revenue, increase it
    const amountChange = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
    
    // Ensure payment method is lowercase
    const paymentMethod = transaction.payment_method.toLowerCase() as keyof Balances;
    currentBalances[paymentMethod] += amountChange;

    await set(balancesRef, currentBalances);
    console.log('Updated balances:', currentBalances);

    return { success: true, transactionId };
  } catch (error) {
    console.error('Error in addTransaction:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateBalance(key: keyof Balances, newBalance: number, selectedMonth: Date = new Date()) {
  console.log(`Updating balance for ${key} to ${newBalance}`);
  
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based
  
  try {
    const balanceRef = ref(db, `months/${year}/${month}/balances/${key}`);
    await set(balanceRef, newBalance);
    console.log(`Balance for ${key} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating balance for ${key}:`, error);
    return false;
  }
}

export async function updateCategoryTotal(category: keyof CategoryTotals, newAmount: number, selectedMonth: Date = new Date()) {
  console.log(`Updating category total for ${category} to ${newAmount}`);
  
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based
  
  try {
    // Update the specific category
    const categoryRef = ref(db, `months/${year}/${month}/categories/${category}`);
    await set(categoryRef, newAmount);
    console.log(`Category total for ${category} updated successfully`);
    
    // Get all categories to recalculate the total expenses
    const categoriesRef = ref(db, `months/${year}/${month}/categories`);
    const categoriesSnapshot = await get(categoriesRef);
    const categories = categoriesSnapshot.val() as CategoryTotals || {
      Habits: 0,
      House: 0,
      Travels: 0,
      Food: 0,
      Investments: 0,
      Transport: 0,
      Other: 0
    };
    
    // Calculate the total expenses (excluding Investments)
    const totalExpenses = Object.entries(categories)
      .filter(([key]) => key !== 'Investments')
      .reduce((sum, [_, value]) => sum + (value || 0), 0);
    
    // Update the monthly totals
    const totalsRef = ref(db, `months/${year}/${month}/totals`);
    const totalsSnapshot = await get(totalsRef);
    const totals = totalsSnapshot.val() || { expenses: 0, revenue: 0, net: 0 };
    
    totals.expenses = totalExpenses;
    totals.net = totals.revenue - totals.expenses;
    
    await set(totalsRef, totals);
    console.log(`Updated monthly totals with recalculated expenses: ${totalExpenses}`);
    
    return true;
  } catch (error) {
    console.error(`Error updating category total for ${category}:`, error);
    return false;
  }
}

export async function updateMonthlyTotal(type: 'expenses' | 'revenue', newAmount: number, selectedMonth: Date = new Date()) {
  console.log(`Updating monthly total for ${type} to ${newAmount}`);
  
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based
  
  try {
    // Get current totals
    const totalsRef = ref(db, `months/${year}/${month}/totals`);
    const totalsSnapshot = await get(totalsRef);
    const currentTotals = totalsSnapshot.val() as MonthlyTotals || {
      expenses: 0,
      revenue: 0,
      net: 0
    };
    
    // Update the specified total
    currentTotals[type] = newAmount;
    
    // Recalculate net
    currentTotals.net = currentTotals.revenue - currentTotals.expenses;
    
    // Save updated totals
    await set(totalsRef, currentTotals);
    console.log(`Monthly total for ${type} updated successfully`);
    return true;
  } catch (error) {
    console.error(`Error updating monthly total for ${type}:`, error);
    return false;
  }
}

export async function deleteTransaction(transaction: Transaction, selectedMonth: Date = new Date()) {
  console.log('Starting deleteTransaction with:', transaction);
  console.log('Transaction ID:', transaction.id);
  console.log('Transaction payment method:', transaction.payment_method);
  
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth() + 1; // JavaScript months are 0-based
  console.log(`Deleting from year: ${year}, month: ${month}`);

  try {
    // 1. Delete the transaction
    const transactionRef = ref(db, `months/${year}/${month}/transactions/${transaction.id}`);
    console.log('Transaction reference path:', `months/${year}/${month}/transactions/${transaction.id}`);
    await set(transactionRef, null);
    console.log('Transaction deleted successfully from Firebase');

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

    // Recalculate the total expenses from categories (excluding Investments)
    if (transaction.type === 'expense') {
      const totalExpenses = Object.entries(currentCategoryTotals)
        .filter(([key]) => key !== 'Investments')
        .reduce((sum, [_, value]) => sum + (value > 0 ? value : 0), 0);
      
      // Update the expenses total to match the sum of categories
      currentTotals.expenses = totalExpenses;
      currentTotals.net = currentTotals.revenue - currentTotals.expenses;
      
      await set(monthlyTotalsRef, currentTotals);
      console.log('Recalculated and updated monthly totals after deletion:', currentTotals);
    }

    // 4. Update payment method balances (reverse the transaction effect)
    const balancesRef = ref(db, `months/${year}/${month}/balances`);
    const balancesSnapshot = await get(balancesRef);
    const currentBalances = balancesSnapshot.val() as Balances || {
      cash: 0,
      ita: 0,
      usa: 0,
      nonna: 0,
      n26: 0,
      revolut: 0,
      paypal: 0
    };

    // If it was an expense, increase the balance; if revenue, decrease it
    const amountChange = transaction.type === 'expense' ? transaction.amount : -transaction.amount;
    
    // Ensure payment method is lowercase and handle potential typos
    let paymentMethod = transaction.payment_method.toLowerCase();
    
    // Fix common typos or malformed payment methods
    if (paymentMethod === 'casht') {
      paymentMethod = 'cash';
      console.log('Corrected payment method from "casht" to "cash"');
    }
    
    // Check if the payment method is valid
    if (!Object.keys(currentBalances).includes(paymentMethod)) {
      console.error(`Invalid payment method: ${paymentMethod}. Using "cash" instead.`);
      paymentMethod = 'cash';
    }
    
    currentBalances[paymentMethod as keyof Balances] += amountChange;
    console.log(`Updated balance for ${paymentMethod}: ${currentBalances[paymentMethod as keyof Balances]}`);

    await set(balancesRef, currentBalances);
    console.log('Updated balances:', currentBalances);

    return true;
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    return false;
  }
} 