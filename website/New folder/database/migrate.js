/**
 * Database Migration Script for KOPMA UNNES
 * Automatically creates database schema and initial data
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD,
  multipleStatements: true
};

// Color console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Main migration function
 */
async function runMigrations() {
  let connection;
  
  try {
    log('\n🗄️  Starting database migrations...', 'bright');
    log('═'.repeat(60), 'blue');
    
    // Create connection
    log('\n📡 Connecting to MySQL server...', 'yellow');
    connection = await mysql.createConnection(config);
    log('✅ Connected successfully!', 'green');
    
    // Read schema file
    log('\n📖 Reading schema file...', 'yellow');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    log('✅ Schema file loaded!', 'green');
    
    // Execute schema
    log('\n🔨 Creating database and tables...', 'yellow');
    const results = await connection.query(schema);
    log('✅ Database schema created successfully!', 'green');
    
    // Verify tables
    log('\n🔍 Verifying tables...', 'yellow');
    const [tables] = await connection.query('SHOW TABLES FROM kopma_db');
    log(`✅ Created ${tables.length} tables:`, 'green');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      log(`   • ${tableName}`, 'blue');
    });
    
    // Show table statistics
    log('\n📊 Table Statistics:', 'bright');
    log('─'.repeat(60), 'blue');
    
    const tableNames = tables.map(t => Object.values(t)[0]);
    for (const tableName of tableNames) {
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM kopma_db.${tableName}`);
      const count = rows[0].count;
      log(`   ${tableName.padEnd(30)} │ ${count} rows`, 'blue');
    }
    
    log('\n' + '═'.repeat(60), 'blue');
    log('✅ Database migrations completed successfully!', 'green');
    log('\n📋 Next Steps:', 'bright');
    log('   1. Change default admin password', 'yellow');
    log('   2. Configure environment variables', 'yellow');
    log('   3. Run the application: npm run dev', 'yellow');
    log('\n💡 Tip: Default admin credentials:', 'bright');
    log('   Username: admin', 'blue');
    log('   Password: admin123 (CHANGE THIS!)', 'red');
    log('');
    
  } catch (error) {
    log('\n❌ Migration failed!', 'red');
    log('Error details:', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('🔌 Database connection closed.', 'yellow');
    }
  }
}

/**
 * Rollback function (drop all tables)
 */
async function rollback() {
  let connection;
  
  try {
    log('\n⚠️  Starting database rollback...', 'yellow');
    log('═'.repeat(60), 'red');
    
    connection = await mysql.createConnection(config);
    
    // Get all tables
    const [tables] = await connection.query('SHOW TABLES FROM kopma_db');
    
    if (tables.length === 0) {
      log('ℹ️  No tables to drop.', 'blue');
      return;
    }
    
    log(`\n🗑️  Dropping ${tables.length} tables...`, 'yellow');
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop each table
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      await connection.query(`DROP TABLE IF EXISTS kopma_db.${tableName}`);
      log(`   ✓ Dropped ${tableName}`, 'red');
    }
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    log('\n✅ Rollback completed successfully!', 'green');
    
  } catch (error) {
    log('\n❌ Rollback failed!', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Reset function (rollback + migrate)
 */
async function reset() {
  log('\n🔄 Resetting database...', 'bright');
  await rollback();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await runMigrations();
}

/**
 * Check database status
 */
async function checkStatus() {
  let connection;
  
  try {
    log('\n📊 Checking database status...', 'bright');
    log('═'.repeat(60), 'blue');
    
    connection = await mysql.createConnection(config);
    
    // Check if database exists
    const [databases] = await connection.query("SHOW DATABASES LIKE 'kopma_db'");
    
    if (databases.length === 0) {
      log('\n❌ Database "kopma_db" does not exist.', 'red');
      log('💡 Run: npm run migrate', 'yellow');
      return;
    }
    
    log('\n✅ Database "kopma_db" exists.', 'green');
    
    // Get table count
    const [tables] = await connection.query('SHOW TABLES FROM kopma_db');
    log(`✅ Tables: ${tables.length}`, 'green');
    
    // Get total rows
    let totalRows = 0;
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [rows] = await connection.query(`SELECT COUNT(*) as count FROM kopma_db.${tableName}`);
      totalRows += rows[0].count;
    }
    
    log(`✅ Total records: ${totalRows}`, 'green');
    log('');
    
  } catch (error) {
    log('\n❌ Status check failed!', 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'up':
  case 'migrate':
    runMigrations();
    break;
  case 'down':
  case 'rollback':
    rollback();
    break;
  case 'reset':
    reset();
    break;
  case 'status':
    checkStatus();
    break;
  default:
    log('\n📖 KOPMA UNNES Database Migration Tool', 'bright');
    log('═'.repeat(60), 'blue');
    log('\nUsage:', 'yellow');
    log('  node migrate.js <command>\n', 'blue');
    log('Commands:', 'yellow');
    log('  up, migrate  │ Run migrations (create tables)', 'blue');
    log('  down, rollback │ Rollback migrations (drop tables)', 'blue');
    log('  reset         │ Reset database (rollback + migrate)', 'blue');
    log('  status        │ Check database status', 'blue');
    log('\nExamples:', 'yellow');
    log('  node migrate.js migrate', 'blue');
    log('  node migrate.js status', 'blue');
    log('  node migrate.js rollback', 'blue');
    log('');
}

module.exports = { runMigrations, rollback, reset, checkStatus };
