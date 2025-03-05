import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set, update } from 'firebase/database';
import { db } from '@/lib/firebase/firebase';

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

async function migratePaymentMethodsToLowercase() {
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
    
    const logs = [];
    
    for (const year of yearsToProcess) {
      for (const month of monthsToProcess) {
        const monthLog = await migrateMonthData(year, month);
        logs.push(...monthLog);
      }
    }
    
    logs.push('Payment methods migration completed successfully!');
    console.log('Payment methods migration completed successfully!');
    return { success: true, logs };
  } catch (error) {
    console.error('Error during payment methods migration:', error);
    return { success: false, error: String(error) };
  }
}

async function migrateMonthData(year: number, month: number) {
  const logs = [];
  const monthPath = `months/${year}/${month}`;
  const monthRef = ref(db, monthPath);
  const monthSnapshot = await get(monthRef);
  
  if (!monthSnapshot.exists()) {
    const message = `No data for ${year}/${month}, skipping...`;
    logs.push(message);
    console.log(message);
    return logs;
  }
  
  const message = `Processing data for ${year}/${month}...`;
  logs.push(message);
  console.log(message);
  
  // 1. Migrate balances
  const balanceLogs = await migrateBalances(year, month);
  logs.push(...balanceLogs);
  
  // 2. Migrate transactions
  const transactionLogs = await migrateTransactions(year, month);
  logs.push(...transactionLogs);
  
  return logs;
}

async function migrateBalances(year: number, month: number) {
  const logs = [];
  const balancesPath = `months/${year}/${month}/balances`;
  const balancesRef = ref(db, balancesPath);
  const balancesSnapshot = await get(balancesRef);
  
  if (!balancesSnapshot.exists()) {
    const message = `No balances for ${year}/${month}, skipping...`;
    logs.push(message);
    console.log(message);
    return logs;
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
  const message = `Migrated balances for ${year}/${month}`;
  logs.push(message);
  console.log(message);
  return logs;
}

async function migrateTransactions(year: number, month: number) {
  const logs = [];
  const transactionsPath = `months/${year}/${month}/transactions`;
  const transactionsRef = ref(db, transactionsPath);
  const transactionsSnapshot = await get(transactionsRef);
  
  if (!transactionsSnapshot.exists()) {
    const message = `No transactions for ${year}/${month}, skipping...`;
    logs.push(message);
    console.log(message);
    return logs;
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
  
  const message = `Migrated ${updatedCount} transactions for ${year}/${month}`;
  logs.push(message);
  console.log(message);
  return logs;
}

export async function GET(request: NextRequest) {
  try {
    const result = await migratePaymentMethodsToLowercase();
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 