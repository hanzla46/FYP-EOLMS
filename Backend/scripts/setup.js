require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');

const setup = async () => {
  console.log('=== EOLMS Database Setup ===\n');

  try {
    await sequelize.authenticate();
    console.log('[OK] Connected to database.\n');
  } catch (err) {
    console.error('[FAIL] Cannot connect to database:', err.message);
    console.error('Check .env file: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD');
    process.exit(1);
  }

  console.log('[1/2] Running schema...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && s !== '');

  for (const stmt of statements) {
    try {
      await sequelize.query(stmt);
    } catch (err) {
      if (!err.message.includes('already exists') && !err.message.includes('Duplicate')) {
        console.error('  Error:', err.message.substring(0, 120));
      }
    }
  }
  console.log('[OK] Schema applied (10 tables).\n');

  const force = process.argv.includes('--force') || process.argv.includes('-f');
  const skipSeed = process.argv.includes('--no-seed');

  if (skipSeed) {
    console.log('[SKIP] Seed skipped (--no-seed flag).');
    console.log('\nSetup complete. Run "npm start" to launch the server.');
    process.exit(0);
  }

  const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM users');

  if (count > 0 && !force) {
    console.log('[SKIP] Database already has data. Use --force to re-seed.');
    console.log('  npm run seed -- --force');
    console.log('\nSetup complete. Run "npm start" to launch the server.');
    process.exit(0);
  }

  console.log('[2/2] Running seed...');
  console.log('  (This creates demo users, animals, and operational data)\n');

  const seed = require('./seed');
  await seed(true);

  console.log('\n[OK] Setup complete.');
  console.log('  Start server: npm start');
  console.log('  Login: admin@eolms.local / admin123');
  process.exit(0);
};

setup();
