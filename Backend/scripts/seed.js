require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const users = [
  { username: 'admin', email: 'admin@eolms.local', password: 'admin123', full_name: 'Farm Administrator', role: 'Admin' },
  { username: 'vet_sarah', email: 'sarah@eolms.local', password: 'vet123', full_name: 'Dr. Sarah Khan', role: 'Vet' },
  { username: 'vet_ahmed', email: 'ahmed@eolms.local', password: 'vet123', full_name: 'Dr. Ahmed Ali', role: 'Vet' },
  { username: 'worker_ali', email: 'ali@eolms.local', password: 'worker123', full_name: 'Ali Hassan', role: 'Worker' },
  { username: 'worker_bilal', email: 'bilal@eolms.local', password: 'worker123', full_name: 'Bilal Mahmood', role: 'Worker' },
  { username: 'worker_fatima', email: 'fatima@eolms.local', password: 'worker123', full_name: 'Fatima Noor', role: 'Worker' },
];

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    await sequelize.query('DELETE FROM users WHERE email LIKE :domain', { replacements: { domain: '%@eolms.local' } });
    console.log('Cleared existing seed users.');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sequelize.query(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (:username, :email, :password, :full_name, :role)',
        { replacements: { ...user, password: hashedPassword } }
      );
      console.log(`Created: ${user.full_name} (${user.role})`);
    }

    console.log('\nSeed complete. Login credentials:');
    console.log('  Admin:   admin@eolms.local / admin123');
    console.log('  Vet:     sarah@eolms.local / vet123');
    console.log('  Vet:     ahmed@eolms.local / vet123');
    console.log('  Worker:  ali@eolms.local / worker123');
    console.log('  Worker:  bilal@eolms.local / worker123');
    console.log('  Worker:  fatima@eolms.local / worker123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
