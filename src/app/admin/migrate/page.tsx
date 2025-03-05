'use client';

import { useState } from 'react';
import { migratePaymentMethodsToLowercase } from '@/lib/firebase/migratePaymentMethods';

export default function MigratePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Override console.log to capture logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  console.log = (...args) => {
    originalConsoleLog(...args);
    setLogs(prev => [...prev, args.join(' ')]);
  };

  console.error = (...args) => {
    originalConsoleError(...args);
    setLogs(prev => [...prev, `ERROR: ${args.join(' ')}`]);
  };

  const runMigration = async () => {
    setIsRunning(true);
    setResult(null);
    setLogs([]);

    try {
      const migrationResult = await migratePaymentMethodsToLowercase();
      setResult(migrationResult);
    } catch (error) {
      setResult({ success: false, error: String(error) });
    } finally {
      setIsRunning(false);
      
      // Restore original console methods
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Database Migration: Payment Methods to Lowercase</h1>
      
      <div className="mb-8">
        <p className="mb-4">
          This migration will update all payment methods in the database to lowercase format.
          This includes:
        </p>
        <ul className="list-disc list-inside mb-4 ml-4">
          <li>Balance keys (ITA → ita, USA → usa, etc.)</li>
          <li>Payment methods in transactions</li>
        </ul>
        <p className="text-yellow-300 mb-4">
          ⚠️ Warning: This operation will modify your database. Make sure you have a backup before proceeding.
        </p>
        
        <button
          onClick={runMigration}
          disabled={isRunning}
          className={`px-4 py-2 rounded ${
            isRunning 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
        >
          {isRunning ? 'Running Migration...' : 'Run Migration'}
        </button>
      </div>
      
      {result && (
        <div className={`p-4 rounded mb-6 ${
          result.success ? 'bg-green-900/50' : 'bg-red-900/50'
        }`}>
          <h2 className="text-xl font-semibold mb-2">
            {result.success ? 'Migration Completed' : 'Migration Failed'}
          </h2>
          {result.error && <p className="text-red-300">{result.error}</p>}
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Migration Logs</h2>
          <div className="bg-gray-800 p-4 rounded max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-sm mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 