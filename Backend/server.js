require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, sequelize } = require('./config/database');
const seed = require('./scripts/seed');
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const inventoryRoutes = require('./routes/inventory');
const healthRecordRoutes = require('./routes/healthRecords');
const vaccinationScheduleRoutes = require('./routes/vaccinationSchedules');
const breedingRecordRoutes = require('./routes/breedingRecords');
const productionLogRoutes = require('./routes/productionLogs');
const financeRoutes = require('./routes/finance');
const alertRoutes = require('./routes/alerts');
const uploadRoutes = require('./routes/uploads');
const cronRoutes = require('./routes/cron');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/v1/health', (req, res) => {
  res.json({ message: 'EOLMS API is running', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/animals', animalRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/health-records', healthRecordRoutes);
app.use('/api/v1/vaccination-schedules', vaccinationScheduleRoutes);
app.use('/api/v1/breeding-records', breedingRecordRoutes);
app.use('/api/v1/production-logs', productionLogRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/cron', cronRoutes);

let initialized = false;

const init = async () => {
  if (initialized) return;
  initialized = true;

  await testConnection();

  let needsSeed = false;
  try {
    const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM users');
    if (count === 0) needsSeed = true;
  } catch (err) {
    if (err.original && err.original.code === 'ER_NO_SUCH_TABLE') {
      console.log('[Setup] Tables not found — creating schema...');
      const fs = require('fs');
      const schema = fs.readFileSync(require('path').join(__dirname, 'scripts', 'schema.sql'), 'utf8');
      const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));
      for (const stmt of statements) {
        try { await sequelize.query(stmt); } catch (e) { /* ignore duplicates */ }
      }
      console.log('[Setup] Schema created.');
      needsSeed = true;
    } else {
      console.error('[Setup] DB error:', err.message);
      return;
    }
  }

  if (needsSeed) {
    console.log('[Seed] Auto-seeding demo data...');
    await seed(true);
    console.log('[Seed] Done.');
  }
};

app.use(async (req, res, next) => {
  await init();
  next();
});

module.exports = app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  const { startCron } = require('./services/notificationCron');
  init().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      startCron();
    });
  });
}
