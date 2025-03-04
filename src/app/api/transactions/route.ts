import { NextRequest, NextResponse } from 'next/server';

// Type definitions matching our OpenAPI spec
type Transaction = {
  type: 'expense' | 'revenue';
  amount: number;
  category: 'Habits' | 'House' | 'Travels' | 'Food' | 'Investments' | 'Transport' | 'Other';
  description: string;
  payment_method: 'cash' | 'ITA' | 'USA' | 'Nonna' | 'N26' | 'Revolut' | 'PayPal';
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
    const transaction: Transaction = await request.json();

    // Basic validation
    if (!transaction || !transaction.type || !transaction.amount || !transaction.category || !transaction.payment_method) {
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

    // For testing, we'll just echo back the received data
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Transaction received successfully',
      data: transaction
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Invalid request data'
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