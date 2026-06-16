const { sequelize } = require('../config/database');

const addItem = async (req, res) => {
  try {
    const { item_name, category, quantity, unit, reorder_threshold, unit_price, supplier, notes } = req.body;

    if (!item_name || !unit) {
      return res.status(400).json({ error: 'Item name and unit are required.' });
    }

    const validCategories = ['Medication', 'Feed', 'Equipment', 'Cleaning', 'Other'];
    const cat = category && validCategories.includes(category) ? category : 'Other';

    const [result] = await sequelize.query(
      `INSERT INTO inventory (item_name, category, quantity, unit, reorder_threshold, unit_price, supplier, notes)
       VALUES (:item_name, :category, :quantity, :unit, :reorder_threshold, :unit_price, :supplier, :notes)`,
      {
        replacements: {
          item_name,
          category: cat,
          quantity: quantity || 0,
          unit,
          reorder_threshold: reorder_threshold || 0,
          unit_price: unit_price || null,
          supplier: supplier || null,
          notes: notes || null,
        },
      }
    );

    const [item] = await sequelize.query('SELECT * FROM inventory WHERE id = :id', {
      replacements: { id: result.insertId || result },
    });

    res.status(201).json({ message: 'Inventory item added.', id: item[0].id, data: item[0] });
  } catch (error) {
    console.error('Add inventory item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { category, search } = req.query;

    let where = 'WHERE 1=1';
    const replacements = {};

    if (category) {
      where += ' AND category = :category';
      replacements.category = category;
    }
    if (search) {
      where += ' AND (item_name LIKE :search OR supplier LIKE :search)';
      replacements.search = `%${search}%`;
    }

    const [items] = await sequelize.query(
      `SELECT * FROM inventory ${where} ORDER BY category, item_name ASC`,
      { replacements }
    );

    res.json({ message: 'Inventory items retrieved.', data: items, total: items.length });
  } catch (error) {
    console.error('List inventory error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [items] = await sequelize.query('SELECT * FROM inventory WHERE id = :id', { replacements: { id } });

    if (items.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    const [usage] = await sequelize.query(
      `SELECT hr.id, hr.record_date, hr.medication_given, hr.medication_quantity, hr.medication_unit,
              a.tag_number AS animal_tag, u.full_name AS vet_name
       FROM health_records hr
       JOIN animals a ON hr.animal_id = a.id
       JOIN users u ON hr.vet_id = u.id
       WHERE hr.inventory_item_id = :id
       ORDER BY hr.record_date DESC
       LIMIT 50`,
      { replacements: { id } }
    );

    res.json({ message: 'Inventory item retrieved.', data: items[0], usage });
  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { item_name, category, unit, reorder_threshold, unit_price, supplier, notes } = req.body;

    const [existing] = await sequelize.query('SELECT * FROM inventory WHERE id = :id', { replacements: { id } });

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    const fields = [];
    const replacements = { id };
    const updatable = { item_name, category, unit, reorder_threshold, unit_price, supplier, notes };

    for (const [key, value] of Object.entries(updatable)) {
      if (value !== undefined) {
        fields.push(`${key} = :${key}`);
        replacements[key] = value;
      }
    }

    if (fields.length > 0) {
      await sequelize.query(`UPDATE inventory SET ${fields.join(', ')} WHERE id = :id`, { replacements });
    }

    const [updated] = await sequelize.query('SELECT * FROM inventory WHERE id = :id', { replacements: { id } });

    res.json({ message: 'Inventory item updated.', data: updated[0] });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const adjustStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { adjustment, note } = req.body;

    if (adjustment === undefined || adjustment === null) {
      await t.rollback();
      return res.status(400).json({ error: 'Adjustment value is required.' });
    }

    const adj = parseFloat(adjustment);

    const [items] = await sequelize.query(
      'SELECT * FROM inventory WHERE id = :id FOR UPDATE',
      { replacements: { id }, transaction: t }
    );

    if (items.length === 0) {
      await t.rollback();
      return res.status(404).json({ error: 'Inventory item not found.' });
    }

    const item = items[0];
    const newQuantity = parseFloat(item.quantity) + adj;

    if (newQuantity < 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Insufficient stock for this adjustment.' });
    }

    await sequelize.query(
      'UPDATE inventory SET quantity = :quantity WHERE id = :id',
      { replacements: { quantity: newQuantity, id }, transaction: t }
    );

    if (item.reorder_threshold > 0 && newQuantity <= parseFloat(item.reorder_threshold)) {
      await sequelize.query(
        `INSERT INTO system_alerts (alert_type, severity, message, reference_entity_type, reference_entity_id)
         VALUES ('LowStock', 'Warning', :message, 'inventory', :ref_id)`,
        {
          replacements: {
            message: `Low stock alert: "${item.item_name}" has ${newQuantity} ${item.unit} remaining (threshold: ${item.reorder_threshold} ${item.unit}).`,
            ref_id: id,
          },
          transaction: t,
        }
      );
    }

    await t.commit();

    const [updated] = await sequelize.query('SELECT * FROM inventory WHERE id = :id', { replacements: { id } });
    res.json({
      message: adj > 0 ? 'Stock added.' : 'Stock deducted.',
      data: updated[0],
      audit_note: note || null,
    });
  } catch (error) {
    await t.rollback();
    console.error('Adjust stock error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { addItem, list, getById, update, adjustStock };
