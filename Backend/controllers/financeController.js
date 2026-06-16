const { sequelize } = require('../config/database');

const createTransaction = async (req, res) => {
  try {
    const { transaction_date, transaction_type, category, amount, description, reference_entity_type, reference_entity_id } = req.body;

    if (!transaction_date || !transaction_type || !category || !amount) {
      return res.status(400).json({ error: 'Date, type, category, and amount are required.' });
    }

    const validTypes = ['Income', 'Expense'];
    if (!validTypes.includes(transaction_type)) {
      return res.status(400).json({ error: `Invalid type. Must be: ${validTypes.join(', ')}.` });
    }

    const validCategories = ['Feed', 'Medication', 'Breeding', 'Equipment', 'Labor', 'Sales', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: `Invalid category. Must be: ${validCategories.join(', ')}.` });
    }

    const [result] = await sequelize.query(
      `INSERT INTO financial_ledger (transaction_date, transaction_type, category, amount, description,
        reference_entity_type, reference_entity_id, created_by)
       VALUES (:transaction_date, :transaction_type, :category, :amount, :description,
        :reference_entity_type, :reference_entity_id, :created_by)`,
      {
        replacements: {
          transaction_date, transaction_type, category, amount: parseFloat(amount),
          description: description || null, reference_entity_type: reference_entity_type || null,
          reference_entity_id: reference_entity_id || null, created_by: req.user.user_id,
        },
      }
    );

    const [txn] = await sequelize.query('SELECT * FROM financial_ledger WHERE id = :id', {
      replacements: { id: result.insertId || result },
    });

    res.status(201).json({
      message: 'Transaction recorded.',
      id: txn[0].id,
      data: {
        ...txn[0],
        amount: `PKR ${parseFloat(txn[0].amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        amount_raw: parseFloat(txn[0].amount),
      },
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { transaction_type, category, date_from, date_to, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (transaction_type) { where += ' AND transaction_type = :type'; replacements.type = transaction_type; }
    if (category) { where += ' AND category = :category'; replacements.category = category; }
    if (date_from) { where += ' AND transaction_date >= :date_from'; replacements.date_from = date_from; }
    if (date_to) { where += ' AND transaction_date <= :date_to'; replacements.date_to = date_to; }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [transactions] = await sequelize.query(
      `SELECT fl.*, u.full_name AS created_by_name
       FROM financial_ledger fl
       JOIN users u ON fl.created_by = u.id
       ${where}
       ORDER BY fl.transaction_date DESC, fl.id DESC
       LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM financial_ledger ${where}`,
      { replacements }
    );

    const formatted = transactions.map(t => ({
      ...t,
      amount: `PKR ${parseFloat(t.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
      amount_raw: parseFloat(t.amount),
    }));

    res.json({
      message: 'Transactions retrieved.',
      data: formatted,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const summary = async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    let where = '';
    const replacements = {};
    if (date_from) { where += ' AND transaction_date >= :date_from'; replacements.date_from = date_from; }
    if (date_to) { where += ' AND transaction_date <= :date_to'; replacements.date_to = date_to; }

    const [byType] = await sequelize.query(
      `SELECT transaction_type, SUM(amount) AS total
       FROM financial_ledger WHERE 1=1 ${where} GROUP BY transaction_type`,
      { replacements }
    );

    const [byCategory] = await sequelize.query(
      `SELECT category, transaction_type, SUM(amount) AS total
       FROM financial_ledger WHERE 1=1 ${where}
       GROUP BY category, transaction_type ORDER BY category`,
      { replacements }
    );

    const [monthly] = await sequelize.query(
      `SELECT DATE_FORMAT(transaction_date, '%Y-%m') AS month, transaction_type, SUM(amount) AS total
       FROM financial_ledger WHERE 1=1 ${where}
       GROUP BY month, transaction_type
       ORDER BY month DESC LIMIT 12`,
      { replacements }
    );

    const income = byType.find(r => r.transaction_type === 'Income')?.total || 0;
    const expenses = byType.find(r => r.transaction_type === 'Expense')?.total || 0;
    const net = parseFloat(income) - parseFloat(expenses);

    res.json({
      message: 'Financial summary.',
      data: {
        income: `PKR ${parseFloat(income).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        income_raw: parseFloat(income),
        expenses: `PKR ${parseFloat(expenses).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        expenses_raw: parseFloat(expenses),
        net: `PKR ${net.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        net_raw: net,
        by_category: byCategory.map(c => ({
          ...c,
          total: `PKR ${parseFloat(c.total).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
          total_raw: parseFloat(c.total),
        })),
        monthly,
      },
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const animalFinancials = async (req, res) => {
  try {
    const { id } = req.params;

    const [animals] = await sequelize.query('SELECT * FROM animals WHERE id = :id', { replacements: { id } });
    if (animals.length === 0) return res.status(404).json({ error: 'Animal not found.' });

    const [expenses] = await sequelize.query(
      `SELECT SUM(amount) AS total_expenses FROM financial_ledger
       WHERE reference_entity_type = 'animal' AND reference_entity_id = :id AND transaction_type = 'Expense'`,
      { replacements: { id } }
    );

    const [revenue] = await sequelize.query(
      `SELECT SUM(amount) AS total_revenue FROM financial_ledger
       WHERE reference_entity_type = 'animal' AND reference_entity_id = :id AND transaction_type = 'Income'`,
      { replacements: { id } }
    );

    const totalExpenses = parseFloat(expenses[0].total_expenses || 0);
    const totalRevenue = parseFloat(revenue[0].total_revenue || 0);
    const netCost = totalExpenses - totalRevenue;

    const [transactions] = await sequelize.query(
      `SELECT * FROM financial_ledger
       WHERE reference_entity_type = 'animal' AND reference_entity_id = :id
       ORDER BY transaction_date DESC`,
      { replacements: { id } }
    );

    res.json({
      message: 'Animal financials retrieved.',
      data: {
        animal: animals[0],
        total_expenses: `PKR ${totalExpenses.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        total_expenses_raw: totalExpenses,
        total_revenue: `PKR ${totalRevenue.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        total_revenue_raw: totalRevenue,
        net_cost_per_head: `PKR ${netCost.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`,
        net_cost_per_head_raw: netCost,
        transactions,
      },
    });
  } catch (error) {
    console.error('Animal financials error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { createTransaction, list, summary, animalFinancials };
