const { sequelize } = require('../config/database');
const { createAlert } = require('../services/alertService');

const logProduction = async (req, res) => {
  try {
    const { animal_id, log_date, production_type, quantity, unit, notes } = req.body;

    if (!animal_id || !log_date || !production_type || quantity === undefined || !unit) {
      return res.status(400).json({ error: 'Animal ID, date, production type, quantity, and unit are required.' });
    }

    if (parseFloat(quantity) < 0) {
      return res.status(400).json({ error: 'Negative production values are not allowed.' });
    }

    const [animals] = await sequelize.query(
      'SELECT id, status, species FROM animals WHERE id = :animal_id',
      { replacements: { animal_id } }
    );

    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal not found.' });
    }

    if (animals[0].status === 'Quarantined') {
      return res.status(400).json({ error: 'Cannot log production for quarantined animals.' });
    }

    const validTypes = ['Milk', 'Weight', 'Wool'];
    if (!validTypes.includes(production_type)) {
      return res.status(400).json({ error: `Invalid production type. Must be: ${validTypes.join(', ')}.` });
    }

    const [result] = await sequelize.query(
      `INSERT INTO production_logs (animal_id, log_date, production_type, quantity, unit, notes, created_by)
       VALUES (:animal_id, :log_date, :production_type, :quantity, :unit, :notes, :created_by)`,
      {
        replacements: {
          animal_id, log_date, production_type, quantity: parseFloat(quantity),
          unit, notes: notes || null, created_by: req.user.user_id,
        },
      }
    );

    const [log] = await sequelize.query('SELECT * FROM production_logs WHERE id = :id', {
      replacements: { id: result.insertId || result },
    });

    const [recent] = await sequelize.query(
      `SELECT quantity FROM production_logs
       WHERE animal_id = :aid AND production_type = :ptype AND id != :id
       ORDER BY log_date DESC LIMIT 4`,
      { replacements: { aid: animal_id, ptype: production_type, id: log[0].id } }
    );

    if (recent.length >= 3) {
      const avg = recent.slice(0, 3).reduce((s, r) => s + parseFloat(r.quantity), 0) / 3;
      const current = parseFloat(quantity);
      if (current < avg * 0.8) {
        const pctDrop = ((1 - current / avg) * 100).toFixed(0);
        await createAlert({
          alert_type: 'ProductionDrop',
          severity: 'Warning',
          message: `Production drop detected: ${log[0].id} for animal #${animal_id} dropped ${pctDrop}% (${current} vs ${avg.toFixed(1)} avg).`,
          reference_entity_type: 'animal',
          reference_entity_id: animal_id,
        });
      }
    }

    res.status(201).json({ message: 'Production logged.', id: log[0].id, data: log[0] });
  } catch (error) {
    console.error('Log production error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { animal_id, production_type, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (animal_id) { where += ' AND pl.animal_id = :animal_id'; replacements.animal_id = animal_id; }
    if (production_type) { where += ' AND pl.production_type = :production_type'; replacements.production_type = production_type; }
    if (date_from) { where += ' AND pl.log_date >= :date_from'; replacements.date_from = date_from; }
    if (date_to) { where += ' AND pl.log_date <= :date_to'; replacements.date_to = date_to; }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [logs] = await sequelize.query(
      `SELECT pl.*, a.tag_number AS animal_tag, a.species AS animal_species
       FROM production_logs pl
       JOIN animals a ON pl.animal_id = a.id
       ${where}
       ORDER BY pl.log_date DESC
       LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM production_logs pl ${where}`,
      { replacements }
    );

    res.json({
      message: 'Production logs retrieved.',
      data: logs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('List production error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const productionStats = async (req, res) => {
  try {
    const { id } = req.params;

    const [animals] = await sequelize.query('SELECT * FROM animals WHERE id = :id', { replacements: { id } });
    if (animals.length === 0) return res.status(404).json({ error: 'Animal not found.' });

    const [stats] = await sequelize.query(
      `SELECT production_type, COUNT(*) AS total_logs, SUM(quantity) AS total_quantity,
              AVG(quantity) AS avg_quantity, MAX(quantity) AS max_quantity, MIN(quantity) AS min_quantity
       FROM production_logs WHERE animal_id = :id
       GROUP BY production_type`,
      { replacements: { id } }
    );

    const [recent] = await sequelize.query(
      `SELECT pl.* FROM production_logs pl WHERE pl.animal_id = :id
       ORDER BY pl.log_date DESC LIMIT 30`,
      { replacements: { id } }
    );

    const dailyAvg = {};
    const recentByType = {};
    for (const log of recent) {
      if (!recentByType[log.production_type]) recentByType[log.production_type] = [];
      recentByType[log.production_type].push(parseFloat(log.quantity));
    }

    for (const [type, values] of Object.entries(recentByType)) {
      if (values.length >= 3) {
        const last3 = values.slice(0, 3);
        dailyAvg[type] = (last3.reduce((a, b) => a + b, 0) / 3).toFixed(2);
      }
    }

    res.json({ message: 'Production stats retrieved.', data: { stats, daily_averages: dailyAvg, recent_logs: recent } });
  } catch (error) {
    console.error('Production stats error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const dashboard = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let dateWhere = '';
    const replacements = {};
    if (date_from) { dateWhere += ' AND log_date >= :date_from'; replacements.date_from = date_from; }
    if (date_to) { dateWhere += ' AND log_date <= :date_to'; replacements.date_to = date_to; }

    const [summary] = await sequelize.query(
      `SELECT production_type, COUNT(*) AS total_logs, SUM(quantity) AS total_quantity,
              AVG(quantity) AS avg_quantity, COUNT(DISTINCT animal_id) AS animal_count,
              DATE(MAX(log_date)) AS last_recorded
       FROM production_logs WHERE 1=1 ${dateWhere} GROUP BY production_type`,
      { replacements }
    );

    const [byDate] = await sequelize.query(
      `SELECT log_date, production_type, SUM(quantity) AS daily_total
       FROM production_logs WHERE log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) ${dateWhere}
       GROUP BY log_date, production_type ORDER BY log_date DESC`,
      { replacements }
    );

    const [topAnimals] = await sequelize.query(
      `SELECT a.id, a.tag_number, a.species, pl.production_type, SUM(pl.quantity) AS total_production
       FROM production_logs pl
       JOIN animals a ON pl.animal_id = a.id
       WHERE 1=1 ${dateWhere}
       GROUP BY a.id, pl.production_type
       ORDER BY total_production DESC
       LIMIT 10`,
      { replacements }
    );

    res.json({ message: 'Dashboard data.', data: { summary, by_date: byDate, top_animals: topAnimals } });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { logProduction, list, productionStats, dashboard };
