const { sequelize } = require('../config/database');

const createAlert = async ({ alert_type, severity = 'Info', message, reference_entity_type = null, reference_entity_id = null }) => {
  try {
    if (reference_entity_type && reference_entity_id) {
      const [existing] = await sequelize.query(
        `SELECT id FROM system_alerts
         WHERE alert_type = :type AND reference_entity_type = :ref_type AND reference_entity_id = :ref_id AND is_read = FALSE
         LIMIT 1`,
        { replacements: { type: alert_type, ref_type: reference_entity_type, ref_id: reference_entity_id } }
      );
      if (existing.length > 0) return;
    }

    await sequelize.query(
      `INSERT INTO system_alerts (alert_type, severity, message, reference_entity_type, reference_entity_id)
       VALUES (:alert_type, :severity, :message, :ref_type, :ref_id)`,
      {
        replacements: { alert_type, severity, message, ref_type: reference_entity_type, ref_id: reference_entity_id },
      }
    );
  } catch (error) {
    console.error('Alert creation error:', error);
  }
};

module.exports = { createAlert };
