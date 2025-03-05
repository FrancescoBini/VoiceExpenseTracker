import { migratePaymentMethodsToLowercase } from '../src/lib/firebase/migratePaymentMethods';

async function main() {
  console.log('Starting payment methods migration...');
  
  try {
    const result = await migratePaymentMethodsToLowercase();
    
    if (result.success) {
      console.log('Migration completed successfully!');
      process.exit(0);
    } else {
      console.error('Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during migration:', error);
    process.exit(1);
  }
}

main(); 