// Simple script to call the migration API
import fetch from 'node-fetch';

async function runMigration() {
  try {
    console.log('Starting migration...');
    const response = await fetch('http://localhost:3000/api/migrate');
    const result = await response.json();
    
    if (result.success) {
      console.log('Migration completed successfully!');
      if (result.logs) {
        console.log('\nMigration logs:');
        result.logs.forEach(log => console.log(log));
      }
    } else {
      console.error('Migration failed:', result.error);
    }
  } catch (error) {
    console.error('Error calling migration API:', error);
  }
}

runMigration(); 