const { sequelize } = require('../config/database');

const getDashboard = async (req, res) => {
  try {
    const [[{ totalAnimals }]] = await sequelize.query('SELECT COUNT(*) AS totalAnimals FROM animals');
    const [[{ activeAnimals }]] = await sequelize.query("SELECT COUNT(*) AS activeAnimals FROM animals WHERE status = 'Active'");
    const [[{ quarantined }]] = await sequelize.query("SELECT COUNT(*) AS quarantined FROM animals WHERE status = 'Quarantined'");
    const [[{ pregnant }]] = await sequelize.query("SELECT COUNT(*) AS pregnant FROM animals WHERE status = 'Pregnant'");
    const [[{ totalUsers }]] = await sequelize.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalInventory }]] = await sequelize.query('SELECT COUNT(*) AS totalInventory FROM inventory');
    const [[{ lowStock }]] = await sequelize.query('SELECT COUNT(*) AS lowStock FROM inventory WHERE reorder_threshold > 0 AND quantity <= reorder_threshold');
    const [[{ totalHealth }]] = await sequelize.query('SELECT COUNT(*) AS totalHealth FROM health_records');
    const [[{ activePregnancies }]] = await sequelize.query('SELECT COUNT(*) AS activePregnancies FROM breeding_records WHERE pregnancy_confirmed = TRUE AND actual_calving_date IS NULL');
    const [[{ calvingDue }]] = await sequelize.query(
      `SELECT COUNT(*) AS calvingDue FROM breeding_records
       WHERE pregnancy_confirmed = TRUE AND actual_calving_date IS NULL
       AND estimated_calving_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)`
    );
    const [[{ unreadAlerts }]] = await sequelize.query('SELECT COUNT(*) AS unreadAlerts FROM system_alerts WHERE is_read = FALSE');

    const [recentAlerts] = await sequelize.query(
      `SELECT * FROM system_alerts WHERE is_read = FALSE
       ORDER BY CASE severity WHEN 'Critical' THEN 0 WHEN 'Warning' THEN 1 ELSE 2 END, created_at DESC
       LIMIT 5`
    );

    const [speciesBreakdown] = await sequelize.query(
      `SELECT species, COUNT(*) AS count FROM animals GROUP BY species ORDER BY count DESC`
    );

    const [monthlyProduction] = await sequelize.query(
      `SELECT production_type, SUM(quantity) AS total
       FROM production_logs WHERE log_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY production_type`
    );

    const [[{ monthlyIncome }]] = await sequelize.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthlyIncome FROM financial_ledger
       WHERE transaction_type = 'Income' AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    const [[{ monthlyExpenses }]] = await sequelize.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthlyExpenses FROM financial_ledger
       WHERE transaction_type = 'Expense' AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
    );

    res.json({
      message: 'Dashboard data retrieved.',
      data: {
        animals: { total: totalAnimals, active: activeAnimals, quarantined, pregnant },
        inventory: { total: totalInventory, low_stock: lowStock },
        health: { total: totalHealth },
        breeding: { active_pregnancies: activePregnancies, calving_due: calvingDue },
        users: { total: totalUsers },
        alerts: { unread: unreadAlerts, recent: recentAlerts },
        species_breakdown: speciesBreakdown,
        production_30d: monthlyProduction,
        finance_30d: { income: monthlyIncome, expenses: monthlyExpenses, net: parseFloat(monthlyIncome) - parseFloat(monthlyExpenses) },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { getDashboard };
