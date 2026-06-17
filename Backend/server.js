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
const { startCron } = require('./services/notificationCron');

const app = express();
const PORT = process.env.PORT || 5000;

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

const start = async () => {
  await testConnection();

  const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM users');
  if (count === 0) {
    console.log('[Seed] Database is empty — auto-seeding...');
    await seed(true);
    console.log('[Seed] Done.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startCron();
  });
};

start();
