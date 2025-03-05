import { ref, get, set, update } from 'firebase/database';
import { db } from './firebase';

interface Balances {
  cash: number;
  ita: number;
  usa: number;
  nonna: number;
  n26: number;
  revolut: number;
  paypal: number;
}

interface Transaction {
  id: string;
  type: 'expense' | 'revenue';
  amount: number;
  category: string;
  description: string;
  payment_method: string;
  timestamp: number;
  created_at: string;
}

/**
 * Migrates all payment methods in the database to lowercase
 * This includes:
 * 1. Payment methods in transactions
 * 2. Balance keys
 */
export async function migratePaymentMethodsToLowercase() {
  try {
    console.log('Starting payment methods migration...');
    
    // Get current date for determining which months to process
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // We'll process the current month and a few months back
    // Adjust the range as needed
    const yearsToProcess = [currentYear, currentYear - 1];
    const monthsToProcess = Array.from({ length: 12 }, (_, i) => i + 1);
    
    for (const year of yearsToProcess) {
      for (const month of monthsToProcess) {
        await migrateMonthData(year, month);
      }
    }
    
    console.log('Payment methods migration completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error during payment methods migration:', error);
    return { success: false, error: String(error) };
  }
}

async function migrateMonthData(year: number, month: number) {
  const monthPath = `months/${year}/${month}`;
  const monthRef = ref(db, monthPath);
  const monthSnapshot = await get(monthRef);
  
  if (!monthSnapshot.exists()) {
    console.log(`No data for ${year}/${month}, skipping...`);
    return;
  }
  
  console.log(`Processing data for ${year}/${month}...`);
  
  // 1. Migrate balances
  await migrateBalances(year, month);
  
  // 2. Migrate transactions
  await migrateTransactions(year, month);
}

async function migrateBalances(year: number, month: number) {
  const balancesPath = `months/${year}/${month}/balances`;
  const balancesRef = ref(db, balancesPath);
  const balancesSnapshot = await get(balancesRef);
  
  if (!balancesSnapshot.exists()) {
    console.log(`No balances for ${year}/${month}, skipping...`);
    return;
  }
  
  const currentBalances = balancesSnapshot.val();
  const newBalances: Balances = {
    cash: 0,
    ita: 0,
    usa: 0,
    nonna: 0,
    n26: 0,
    revolut: 0,
    paypal: 0
  };
  
  // Map old uppercase keys to new lowercase keys
  const keyMappings: Record<string, keyof Balances> = {
    'cash': 'cash',
    'CASH': 'cash',
    'ITA': 'ita',
    'USA': 'usa',
    'Nonna': 'nonna',
    'NONNA': 'nonna',
    'N26': 'n26',
    'Revolut': 'revolut',
    'REVOLUT': 'revolut',
    'PayPal': 'paypal',
    'PAYPAL': 'paypal'
  };
  
  // Transfer values from old keys to new lowercase keys
  for (const [oldKey, value] of Object.entries(currentBalances)) {
    const newKey = keyMappings[oldKey] || oldKey.toLowerCase() as keyof Balances;
    if (newKey in newBalances) {
      newBalances[newKey] = Number(value);
    }
  }
  
  // Save the updated balances
  await set(balancesRef, newBalances);
  console.log(`Migrated balances for ${year}/${month}`);
}

async function migrateTransactions(year: number, month: number) {
  const transactionsPath = `months/${year}/${month}/transactions`;
  const transactionsRef = ref(db, transactionsPath);
  const transactionsSnapshot = await get(transactionsRef);
  
  if (!transactionsSnapshot.exists()) {
    console.log(`No transactions for ${year}/${month}, skipping...`);
    return;
  }
  
  const transactions = transactionsSnapshot.val();
  let updatedCount = 0;
  
  for (const [id, transaction] of Object.entries<Transaction>(transactions)) {
    if (transaction.payment_method && transaction.payment_method !== transaction.payment_method.toLowerCase()) {
      // Update the payment method to lowercase
      const transactionRef = ref(db, `${transactionsPath}/${id}`);
      await update(transactionRef, {
        payment_method: transaction.payment_method.toLowerCase()
      });
      updatedCount++;
    }
  }
  
  console.log(`Migrated ${updatedCount} transactions for ${year}/${month}`);
} 