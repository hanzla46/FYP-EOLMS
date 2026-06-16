const { sequelize } = require('../config/database');

const create = async (req, res) => {
  try {
    const { vaccine_name, target_species, age_days, booster_interval_days, inventory_item_id, notes } = req.body;

    if (!vaccine_name) {
      return res.status(400).json({ error: 'Vaccine name is required.' });
    }

    const [result] = await sequelize.query(
      `INSERT INTO vaccination_schedules (vaccine_name, target_species, age_days, booster_interval_days, inventory_item_id, notes)
       VALUES (:vaccine_name, :target_species, :age_days, :booster_interval_days, :inventory_item_id, :notes)`,
      {
        replacements: {
          vaccine_name,
          target_species: target_species || 'All',
          age_days: age_days || null,
          booster_interval_days: booster_interval_days || null,
          inventory_item_id: inventory_item_id || null,
          notes: notes || null,
        },
      }
    );

    const [schedule] = await sequelize.query(
      `SELECT vs.*, i.item_name AS inventory_item_name, i.quantity AS inventory_stock, i.unit AS inventory_unit
       FROM vaccination_schedules vs
       LEFT JOIN inventory i ON vs.inventory_item_id = i.id
       WHERE vs.id = :id`,
      { replacements: { id: result.insertId || result } }
    );

    res.status(201).json({ message: 'Vaccination schedule created.', id: schedule[0].id, data: schedule[0] });
  } catch (error) {
    console.error('Create vax schedule error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { target_species } = req.query;
    let where = 'WHERE 1=1';
    const replacements = {};

    if (target_species) {
      where += ' AND (vs.target_species = :species OR vs.target_species = :all)';
      replacements.species = target_species;
      replacements.all = 'All';
    }

    const [schedules] = await sequelize.query(
      `SELECT vs.*, i.item_name AS inventory_item_name, i.quantity AS inventory_stock, i.unit AS inventory_unit
       FROM vaccination_schedules vs
       LEFT JOIN inventory i ON vs.inventory_item_id = i.id
       ${where} ORDER BY vs.vaccine_name ASC`,
      { replacements }
    );

    res.json({ message: 'Vaccination schedules retrieved.', data: schedules, total: schedules.length });
  } catch (error) {
    console.error('List vax schedules error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { create, list };
