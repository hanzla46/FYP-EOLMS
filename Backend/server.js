require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/auth');
const animalRoutes = require('./routes/animals');
const inventoryRoutes = require('./routes/inventory');
const healthRecordRoutes = require('./routes/healthRecords');
const vaccinationScheduleRoutes = require('./routes/vaccinationSchedules');

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

const start = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
