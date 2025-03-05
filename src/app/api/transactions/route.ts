import { NextRequest, NextResponse } from 'next/server';
import { addTransaction } from '@/lib/firebase/transactionUtils';

// Type definitions matching our OpenAPI spec
type Transaction = {
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ita' | 'usa' | 'nonna' | 'n26' | 'revolut' | 'paypal';
};

// Handle GET requests
export async function GET(request: NextRequest) {
  try {
    return new NextResponse(JSON.stringify({
      name: "Expense Tracker API",
      version: "1.0.0",
      endpoints: {
        POST: "/api/transactions - Add a new transaction",
      },
      documentation: "Send a POST request with a transaction object to add a new transaction",
      example: {
        type: "expense",
        amount: 10.50,
        category: "Food",
        description: "Lunch at cafe",
        payment_method: "cash"
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to /api/transactions');
    const transaction: Transaction = await request.json();
    console.log('Parsed transaction:', transaction);

    // Basic validation
    if (!transaction || !transaction.type || !transaction.amount || !transaction.category || !transaction.payment_method) {
      console.log('Validation failed:', { transaction });
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Add timestamp to the transaction
    const transactionWithTimestamp = {
      ...transaction,
      timestamp: Date.now()
    };
    console.log('Adding timestamp:', transactionWithTimestamp);

    // Store in Firebase and update totals
    const result = await addTransaction(transactionWithTimestamp);
    console.log('Firebase result:', result);

    if (!result.success) {
      console.error('Firebase error:', result.error);
      return new NextResponse(JSON.stringify({
        success: false,
        error: result.error
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const response = {
      success: true,
      message: 'Transaction stored successfully',
      data: transactionWithTimestamp
    };
    console.log('Sending response:', response);

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('API error:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
} 