# Payment Methods Migration

This document provides instructions on how to migrate payment methods in the Firebase database to lowercase format.

## Background

There was an issue with payment methods case sensitivity in the application. While the code was expecting lowercase payment methods (`cash`, `ita`, `usa`, etc.), some data in the Firebase database was stored with uppercase payment methods (`CASH`, `ITA`, `USA`, etc.). This caused issues when updating balances for payment methods other than "cash".

## Migration Options

There are two ways to run the migration:

### Option 1: Web Interface

1. Start the development server:
   ```
   npm run dev
   ```

2. Navigate to the migration page:
   ```
   http://localhost:3000/admin/migrate
   ```

3. Click the "Run Migration" button and wait for the process to complete.

### Option 2: Command Line

1. Install dependencies:
   ```
   npm install
   ```

2. Run the migration script:
   ```
   npm run migrate:payment-methods
   ```

## What the Migration Does

The migration script performs the following actions:

1. Converts all payment method keys in the balances object to lowercase:
   - `ITA` → `ita`
   - `USA` → `usa`
   - `Nonna` → `nonna`
   - `N26` → `n26`
   - `Revolut` → `revolut`
   - `PayPal` → `paypal`
   - `CASH` → `cash`

2. Updates all transaction records to use lowercase payment methods.

## Verification

After running the migration, you should verify that:

1. All payment methods in the balances table are displayed correctly
2. New transactions with any payment method update the correct balance
3. The transaction history shows payment methods correctly

## Troubleshooting

If you encounter any issues during or after the migration:

1. Check the migration logs for error messages
2. Verify that the Firebase database structure matches the expected format
3. Ensure that you have the necessary permissions to write to the Firebase database 