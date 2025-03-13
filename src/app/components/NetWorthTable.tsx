'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { ref, update } from 'firebase/database';
import { db } from '@/lib/firebase/firebase';

interface NetWorthData {
  [key: string]: number;
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

interface NetWorthTableProps {
  data?: NetWorthData;
  balances?: Balances;
}

export default function NetWorthTable({ data, balances }: NetWorthTableProps) {
  // Default data from the image if none is provided
  const defaultData: NetWorthData = {
    'binance': 1491,
    'nft': 0,
    'metamask': 1379,
    'near': 150,
    'coinbase': 7,
    'venmo': 0,
    'robinhood': 7432,
    'solana+kresus': 1391,
    'dollar': 57,
    'indonesia': 5127,
  };

  // Use provided data or default data for non-balance accounts
  const initialNetWorthData = data || defaultData;

  // Create ordered data with balances first
  const createOrderedData = () => {
    const ordered: Record<string, number> = {};
    
    // Add balances first (if provided)
    if (balances) {
      ordered['cash'] = balances.cash;
      ordered['ita'] = balances.ita;
      ordered['usa'] = balances.usa;
      ordered['nonna'] = balances.nonna;
      ordered['n26'] = balances.n26;
      ordered['revolut'] = balances.revolut;
      ordered['paypal'] = balances.paypal;
    } else {
      // Use default values if balances not provided
      ordered['cash'] = 0;
      ordered['ita'] = 0;
      ordered['usa'] = 0;
      ordered['nonna'] = 0;
      ordered['n26'] = 979; // From the image
      ordered['revolut'] = 3340; // From the image
      ordered['paypal'] = 333; // From the image
    }

    // Add the rest of the data
    Object.entries(initialNetWorthData).forEach(([key, value]) => {
      // Skip 'Euro' entry
      if (key.toLowerCase() !== 'euro') {
        ordered[key] = value;
      }
    });

    return ordered;
  };

  const [orderedData, setOrderedData] = useState<Record<string, number>>(createOrderedData);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(0);
  const [editingName, setEditingName] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState<number>(0);

  // Calculate total net worth
  const totalNetWorth = Object.values(orderedData).reduce((sum, value) => sum + value, 0);

  // Update Firebase when data changes
  const updateFirebase = (newData: Record<string, number>) => {
    // Get current date to determine the path
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-based
    
    // Extract balances from the data
    const updatedBalances = {
      cash: newData.cash || 0,
      ita: newData.ita || 0,
      usa: newData.usa || 0,
      nonna: newData.nonna || 0,
      n26: newData.n26 || 0,
      revolut: newData.revolut || 0,
      paypal: newData.paypal || 0
    };
    
    // Extract other net worth items
    const otherNetWorth: Record<string, number> = {};
    Object.entries(newData).forEach(([key, value]) => {
      if (!['cash', 'ita', 'usa', 'nonna', 'n26', 'revolut', 'paypal'].includes(key)) {
        otherNetWorth[key] = value;
      }
    });
    
    // Update Firebase
    const updates: Record<string, any> = {};
    updates[`months/${year}/${month}/balances`] = updatedBalances;
    updates[`months/${year}/${month}/netWorth`] = otherNetWorth;
    
    update(ref(db), updates)
      .then(() => console.log('Net worth data updated successfully'))
      .catch(error => console.error('Error updating net worth data:', error));
  };

  // Handle editing an item
  const startEditing = (key: string, value: number) => {
    setEditingKey(key);
    setEditingValue(value);
    setEditingName(key);
  };

  // Save edited item
  const saveEdit = () => {
    if (editingKey) {
      const newData = { ...orderedData };
      
      // If name changed, remove old key and add new one
      if (editingName !== editingKey) {
        delete newData[editingKey];
        newData[editingName] = editingValue;
      } else {
        // Just update the value
        newData[editingKey] = editingValue;
      }
      
      setOrderedData(newData);
      setEditingKey(null);
      
      // Update Firebase
      updateFirebase(newData);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingKey(null);
  };

  // Add new item
  const addNewItem = () => {
    if (newItemName.trim() !== '') {
      const newData = { ...orderedData };
      newData[newItemName] = newItemValue;
      setOrderedData(newData);
      setIsAddingNew(false);
      setNewItemName('');
      setNewItemValue(0);
      
      // Update Firebase
      updateFirebase(newData);
    }
  };

  // Delete an item
  const deleteItem = (key: string) => {
    // Don't allow deleting balance accounts
    if (['cash', 'ita', 'usa', 'nonna', 'n26', 'revolut', 'paypal'].includes(key)) {
      return;
    }
    
    const newData = { ...orderedData };
    delete newData[key];
    setOrderedData(newData);
    
    // Update Firebase
    updateFirebase(newData);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 shadow-lg relative">
      <h2 className="text-sm font-medium text-center mb-2">Net Worth</h2>
      
      {/* Add button */}
      <button 
        onClick={() => setIsAddingNew(true)}
        className="absolute top-3 right-3 text-gray-300 hover:text-white"
      >
        <FaPlus />
      </button>
      
      <div>
        <table className="w-full text-xs">
          <tbody>
            {/* Add new item form */}
            {isAddingNew && (
              <tr className="border-b border-gray-700">
                <td className="py-1">
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                    placeholder="Name"
                    autoFocus
                  />
                </td>
                <td className="py-1 text-right">
                  <input
                    type="number"
                    value={newItemValue}
                    onChange={(e) => setNewItemValue(Number(e.target.value))}
                    className="w-full bg-gray-700 text-white px-2 py-1 rounded text-right"
                    placeholder="Value"
                  />
                </td>
                <td className="py-1 pl-2 flex space-x-1">
                  <button onClick={addNewItem} className="text-green-500 hover:text-green-400">
                    <FaCheck />
                  </button>
                  <button onClick={() => setIsAddingNew(false)} className="text-red-500 hover:text-red-400">
                    <FaTimes />
                  </button>
                </td>
              </tr>
            )}
            
            {/* Existing items */}
            {Object.entries(orderedData).map(([account, amount]) => (
              <tr key={account} className="border-b border-gray-700 last:border-0 group hover:bg-gray-700/30">
                {editingKey === account ? (
                  <>
                    <td className="py-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
                        autoFocus
                      />
                    </td>
                    <td className="py-1 text-right">
                      <input
                        type="number"
                        value={editingValue}
                        onChange={(e) => setEditingValue(Number(e.target.value))}
                        className="w-full bg-gray-700 text-white px-2 py-1 rounded text-right"
                      />
                    </td>
                    <td className="py-1 pl-2 flex space-x-1">
                      <button onClick={saveEdit} className="text-green-500 hover:text-green-400">
                        <FaCheck />
                      </button>
                      <button onClick={cancelEdit} className="text-red-500 hover:text-red-400">
                        <FaTimes />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-1 text-gray-300">{account}</td>
                    <td className="py-1 text-right text-gray-300">
                      {amount}
                    </td>
                    <td className="py-1 pl-2 flex space-x-1">
                      <button 
                        onClick={() => startEditing(account, amount)} 
                        className="text-blue-500 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaEdit />
                      </button>
                      {!['cash', 'ita', 'usa', 'nonna', 'n26', 'revolut', 'paypal'].includes(account) && (
                        <button 
                          onClick={() => deleteItem(account)} 
                          className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t-2 border-gray-600 mt-1 pt-1">
        <div className="flex justify-between text-sm">
          <span className="font-bold text-white">Total</span>
          <span className="font-bold text-white">{totalNetWorth}</span>
        </div>
      </div>
    </div>
  );
} 