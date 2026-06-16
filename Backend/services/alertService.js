const { sequelize } = require('../config/database');

const createAlert = async ({ alert_type, severity = 'Info', message, reference_entity_type = null, reference_entity_id = null }) => {
  try {
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
