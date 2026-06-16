const { sequelize } = require('../config/database');

const createRecord = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      animal_id, vet_id, record_date, diagnosis, treatment,
      medication_given, medication_quantity, medication_unit,
      inventory_item_id, withdrawal_days, notes
    } = req.body;

    if (!animal_id || !vet_id || !record_date) {
      await t.rollback();
      return res.status(400).json({ error: 'Animal ID, vet ID, and record date are required.' });
    }

    const [animals] = await sequelize.query(
      'SELECT id, status FROM animals WHERE id = :animal_id',
      { replacements: { animal_id }, transaction: t }
    );
    if (animals.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Animal not found.' });
    }

    let withdrawalEndDate = null;
    if (withdrawal_days > 0) {
      withdrawalEndDate = new Date(record_date);
      withdrawalEndDate.setDate(withdrawalEndDate.getDate() + parseInt(withdrawal_days));

      await sequelize.query(
        'UPDATE animals SET status = :status WHERE id = :id',
        { replacements: { status: 'Quarantined', id: animal_id }, transaction: t }
      );
    }

    if (inventory_item_id && medication_quantity > 0) {
      const [items] = await sequelize.query(
        'SELECT * FROM inventory WHERE id = :inv_id FOR UPDATE',
        { replacements: { inv_id: inventory_item_id }, transaction: t }
      );
      if (items.length === 0) {
        await t.rollback();
        return res.status(404).json({ error: 'Inventory item not found.' });
      }
      const item = items[0];
      const newQty = parseFloat(item.quantity) - parseFloat(medication_quantity);
      if (newQty < 0) {
        await t.rollback();
        return res.status(400).json({ error: `Insufficient stock. Available: ${item.quantity} ${item.unit}.` });
      }
      await sequelize.query(
        'UPDATE inventory SET quantity = :qty WHERE id = :inv_id',
        { replacements: { qty: newQty, inv_id: inventory_item_id }, transaction: t }
      );

      if (item.reorder_threshold > 0 && newQty <= parseFloat(item.reorder_threshold)) {
        await sequelize.query(
          `INSERT INTO system_alerts (alert_type, severity, message, reference_entity_type, reference_entity_id)
           VALUES ('LowStock', 'Warning', :msg, 'inventory', :ref_id)`,
          { replacements: { msg: `Low stock: "${item.item_name}" is now at ${newQty} ${item.unit}.`, ref_id: inventory_item_id }, transaction: t }
        );
      }
    }

    const [result] = await sequelize.query(
      `INSERT INTO health_records (animal_id, vet_id, record_date, diagnosis, treatment, medication_given,
        medication_quantity, medication_unit, inventory_item_id, withdrawal_days, withdrawal_end_date, notes, created_by)
       VALUES (:animal_id, :vet_id, :record_date, :diagnosis, :treatment, :medication_given,
        :medication_quantity, :medication_unit, :inventory_item_id, :withdrawal_days, :withdrawal_end_date, :notes, :created_by)`,
      {
        replacements: {
          animal_id, vet_id, record_date, diagnosis: diagnosis || null, treatment: treatment || null,
          medication_given: medication_given || null, medication_quantity: medication_quantity || 0,
          medication_unit: medication_unit || null, inventory_item_id: inventory_item_id || null,
          withdrawal_days: withdrawal_days || 0, withdrawal_end_date: withdrawalEndDate,
          notes: notes || null, created_by: req.user.user_id,
        },
        transaction: t,
      }
    );

    await t.commit();

    const [record] = await sequelize.query('SELECT * FROM health_records WHERE id = :id', {
      replacements: { id: result.insertId || result },
    });

    res.status(201).json({ message: 'Health record created.', id: record[0].id, data: record[0] });
  } catch (error) {
    await t.rollback();
    console.error('Create health record error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { animal_id, vet_id, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (animal_id) { where += ' AND hr.animal_id = :animal_id'; replacements.animal_id = animal_id; }
    if (vet_id) { where += ' AND hr.vet_id = :vet_id'; replacements.vet_id = vet_id; }
    if (date_from) { where += ' AND hr.record_date >= :date_from'; replacements.date_from = date_from; }
    if (date_to) { where += ' AND hr.record_date <= :date_to'; replacements.date_to = date_to; }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [records] = await sequelize.query(
      `SELECT hr.*, a.tag_number AS animal_tag, a.species AS animal_species,
              u.full_name AS vet_name
       FROM health_records hr
       JOIN animals a ON hr.animal_id = a.id
       JOIN users u ON hr.vet_id = u.id
       ${where}
       ORDER BY hr.record_date DESC
       LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM health_records hr ${where}`,
      { replacements }
    );

    res.json({
      message: 'Health records retrieved.',
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('List health records error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await sequelize.query(
      `SELECT hr.*, a.tag_number AS animal_tag, a.species AS animal_species,
              u.full_name AS vet_name
       FROM health_records hr
       JOIN animals a ON hr.animal_id = a.id
       JOIN users u ON hr.vet_id = u.id
       WHERE hr.id = :id`,
      { replacements: { id } }
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Health record not found.' });
    }

    const [attachments] = await sequelize.query(
      'SELECT * FROM attachments WHERE entity_type = :type AND entity_id = :id',
      { replacements: { type: 'health_record', id } }
    );

    res.json({ message: 'Health record retrieved.', data: records[0], attachments });
  } catch (error) {
    console.error('Get health record error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getHealthHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await sequelize.query(
      `SELECT hr.*, u.full_name AS vet_name
       FROM health_records hr
       JOIN users u ON hr.vet_id = u.id
       WHERE hr.animal_id = :id
       ORDER BY hr.record_date DESC`,
      { replacements: { id } }
    );

    res.json({ message: 'Health history retrieved.', data: records, total: records.length });
  } catch (error) {
    console.error('Health history error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createRecord, list, getById, getHealthHistory };
