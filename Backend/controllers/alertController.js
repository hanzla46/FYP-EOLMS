const { sequelize } = require('../config/database');

const list = async (req, res) => {
  try {
    const { alert_type, severity, is_read, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (alert_type) { where += ' AND alert_type = :type'; replacements.type = alert_type; }
    if (severity) { where += ' AND severity = :severity'; replacements.severity = severity; }
    if (is_read !== undefined) { where += ' AND is_read = :is_read'; replacements.is_read = is_read === 'true' ? 1 : 0; }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [alerts] = await sequelize.query(
      `SELECT * FROM system_alerts ${where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM system_alerts ${where}`,
      { replacements }
    );

    res.json({
      message: 'Alerts retrieved.',
      data: alerts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('List alerts error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const unreadCount = async (req, res) => {
  try {
    const [result] = await sequelize.query(
      'SELECT COUNT(*) AS count FROM system_alerts WHERE is_read = FALSE'
    );

    res.json({ message: 'Unread count.', unread_count: result[0].count });
  } catch (error) {
    console.error('Unread count error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [alerts] = await sequelize.query('SELECT id FROM system_alerts WHERE id = :id', { replacements: { id } });

    if (alerts.length === 0) {
      return res.status(404).json({ error: 'Alert not found.' });
    }

    await sequelize.query('UPDATE system_alerts SET is_read = TRUE WHERE id = :id', { replacements: { id } });

    res.json({ message: 'Alert marked as read.' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { list, unreadCount, markRead };
