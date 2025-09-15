import { query } from '../src/config/database';

/**
 * Script to identify and fix API keys with invalid website_id values
 * This script will:
 * 1. Find all API keys with invalid website_id values (null, NaN, or <= 0)
 * 2. List them for review
 * 3. Optionally fix them by setting a default website_id or marking them for deletion
 */

async function findInvalidWebsiteIds() {
    console.log('🔍 Searching for API keys with invalid website_id values...');

    try {
        // Find API keys with null, NaN, or invalid website_id values
        const sql = `
      SELECT id, user_id, company_id, scope, website_id, created_at 
      FROM api_keys 
      WHERE website_id IS NULL 
         OR website_id <= 0 
         OR website_id::text = 'NaN'
    `;

        const result = await query(sql);

        if (result.rows.length === 0) {
            console.log('✅ No API keys with invalid website_id values found.');
            return;
        }

        console.log(`❌ Found ${result.rows.length} API keys with invalid website_id values:`);
        console.log('\nInvalid API Keys:');
        console.log('ID | User ID | Company ID | Scope | Website ID | Created At');
        console.log('---|---------|------------|-------|------------|------------');

        result.rows.forEach(row => {
            console.log(`${row.id} | ${row.user_id} | ${row.company_id || 'NULL'} | ${row.scope} | ${row.website_id} | ${row.created_at}`);
        });

        return result.rows;
    } catch (error) {
        console.error('❌ Error finding invalid website_id values:', error);
        throw error;
    }
}

async function getValidWebsiteIds() {
    console.log('\n🔍 Getting list of valid website IDs...');

    try {
        const sql = 'SELECT id, name FROM websites ORDER BY id';
        const result = await query(sql);

        if (result.rows.length === 0) {
            console.log('❌ No websites found in the database.');
            return [];
        }

        console.log(`✅ Found ${result.rows.length} valid websites:`);
        result.rows.forEach(row => {
            console.log(`  ID: ${row.id} - ${row.name}`);
        });

        return result.rows;
    } catch (error) {
        console.error('❌ Error getting valid website IDs:', error);
        throw error;
    }
}

async function fixInvalidWebsiteIds(invalidKeys: any[], validWebsites: any[]) {
    if (invalidKeys.length === 0) {
        console.log('✅ No invalid keys to fix.');
        return;
    }

    if (validWebsites.length === 0) {
        console.log('❌ No valid websites available. Cannot fix invalid website_id values.');
        return;
    }

    // Use the first valid website as default
    const defaultWebsiteId = validWebsites[0].id;
    console.log(`\n🔧 Fixing invalid website_id values by setting them to default website ID: ${defaultWebsiteId} (${validWebsites[0].name})`);

    try {
        const updateSql = `
      UPDATE api_keys 
      SET website_id = $1, updated_at = NOW() 
      WHERE id = ANY($2)
    `;

        const keyIds = invalidKeys.map(key => key.id);
        await query(updateSql, [defaultWebsiteId, keyIds]);

        console.log(`✅ Successfully updated ${invalidKeys.length} API keys with valid website_id.`);

        // Verify the fix
        const verifySql = `
      SELECT id, website_id 
      FROM api_keys 
      WHERE id = ANY($1)
    `;

        const verifyResult = await query(verifySql, [keyIds]);
        console.log('\n📋 Verification - Updated API Keys:');
        verifyResult.rows.forEach(row => {
            console.log(`  API Key ID: ${row.id} - Website ID: ${row.website_id}`);
        });

    } catch (error) {
        console.error('❌ Error fixing invalid website_id values:', error);
        throw error;
    }
}

async function deleteInvalidApiKeys(invalidKeys: any[]) {
    if (invalidKeys.length === 0) {
        console.log('✅ No invalid keys to delete.');
        return;
    }

    console.log(`\n🗑️  Deleting ${invalidKeys.length} API keys with invalid website_id values...`);

    try {
        const deleteSql = 'DELETE FROM api_keys WHERE id = ANY($1)';
        const keyIds = invalidKeys.map(key => key.id);

        await query(deleteSql, [keyIds]);

        console.log(`✅ Successfully deleted ${invalidKeys.length} API keys with invalid website_id values.`);
    } catch (error) {
        console.error('❌ Error deleting invalid API keys:', error);
        throw error;
    }
}

async function main() {
    console.log('🚀 Starting API Key website_id validation and fix script...\n');

    try {
        // Step 1: Find invalid website_id values
        const invalidKeys = await findInvalidWebsiteIds();

        if (!invalidKeys || invalidKeys.length === 0) {
            console.log('✅ No action needed. All API keys have valid website_id values.');
            return;
        }

        // Step 2: Get valid website IDs
        const validWebsites = await getValidWebsiteIds();

        if (validWebsites.length === 0) {
            console.log('❌ No valid websites found. Cannot proceed with fixing invalid website_id values.');
            return;
        }

        // Step 3: Ask user what to do
        console.log('\n🤔 What would you like to do with the invalid API keys?');
        console.log('1. Fix them by setting a default website_id');
        console.log('2. Delete them');
        console.log('3. Just list them (no action)');

        // For now, we'll default to fixing them
        // In a real scenario, you might want to add user input handling
        const action = process.argv[2] || '1';

        switch (action) {
            case '1':
                await fixInvalidWebsiteIds(invalidKeys, validWebsites);
                break;
            case '2':
                await deleteInvalidApiKeys(invalidKeys);
                break;
            case '3':
                console.log('✅ Listed invalid API keys. No action taken.');
                break;
            default:
                console.log('❌ Invalid action. Use 1, 2, or 3.');
                break;
        }

        console.log('\n✅ Script completed successfully!');

    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

export { findInvalidWebsiteIds, fixInvalidWebsiteIds, deleteInvalidApiKeys }; 