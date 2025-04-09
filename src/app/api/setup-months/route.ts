import { NextRequest, NextResponse } from 'next/server';
import { ref, get, set } from 'firebase/database';
import { db } from '@/lib/firebase/firebase';

// Default structure for a new month
const defaultMonthData = {
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
};

export async function POST(request: NextRequest) {
  try {
    // Add remaining months for 2025 (6-12)
    for (let month = 6; month <= 12; month++) {
      const monthRef = ref(db, `months/2025/${month}`);
      const monthSnapshot = await get(monthRef);
      
      if (!monthSnapshot.exists()) {
        await set(monthRef, defaultMonthData);
        console.log(`Created month 2025/${month}`);
      }
    }

    // Add all months for years 2026-2028
    for (let year = 2026; year <= 2028; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthRef = ref(db, `months/${year}/${month}`);
        const monthSnapshot = await get(monthRef);
        
        if (!monthSnapshot.exists()) {
          await set(monthRef, defaultMonthData);
          console.log(`Created month ${year}/${month}`);
        }
      }
      console.log(`Completed year ${year}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully added remaining months for 2025 and all months for 2026-2028'
    });
  } catch (error) {
    console.error('Error setting up months:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 