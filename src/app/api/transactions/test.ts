async function testTransactionAPI() {
  try {
    const response = await fetch('https://4mar.vercel.app/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'expense',
        amount: 10.50,
        category: 'Food',
        description: 'Lunch at cafe',
        payment_method: 'cash'
      })
    });

    const data = await response.json();
    console.log('API Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testTransactionAPI(); 