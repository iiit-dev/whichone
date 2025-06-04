import sequelize from '../database/index.js';
import { up as addVerificationCodesTable } from './add_verification_codes_table.js';
import { up as addUserProfileFields } from './add_user_profile_fields.js';

async function runMigrations() {
  try {
    console.log('Running migrations...');
    // Skip the verification fields migration since it's already applied
    console.log('Creating verification codes table...');
    await addVerificationCodesTable(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Adding user profile fields...');
    await addUserProfileFields(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 