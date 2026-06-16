const { sequelize } = require('../config/database');

const GESTATION_DAYS = { Cattle: 283, Sheep: 150, Goat: 150 };

const logInsemination = async (req, res) => {
  try {
    const { dam_id, sire_identity, insemination_date, insemination_type, notes } = req.body;

    if (!dam_id || !sire_identity || !insemination_date) {
      return res.status(400).json({ error: 'Dam ID, sire identity, and insemination date are required.' });
    }

    const [dams] = await sequelize.query(
      'SELECT id, species, gender, status FROM animals WHERE id = :dam_id',
      { replacements: { dam_id } }
    );

    if (dams.length === 0) {
      return res.status(404).json({ error: 'Dam not found.' });
    }

    const dam = dams[0];

    if (dam.gender !== 'Female') {
      return res.status(400).json({ error: 'Dam must be a female animal.' });
    }

    const [activePregnancy] = await sequelize.query(
      'SELECT id FROM breeding_records WHERE dam_id = :dam_id AND pregnancy_confirmed = TRUE AND actual_calving_date IS NULL',
      { replacements: { dam_id } }
    );

    if (activePregnancy.length > 0) {
      return res.status(400).json({ error: 'Dam already has an active pregnancy.' });
    }

    const validTypes = ['Natural', 'AI'];
    const type = insemination_type && validTypes.includes(insemination_type) ? insemination_type : 'Natural';

    const [result] = await sequelize.query(
      `INSERT INTO breeding_records (dam_id, sire_identity, insemination_date, insemination_type, notes, created_by)
       VALUES (:dam_id, :sire_identity, :insemination_date, :insemination_type, :notes, :created_by)`,
      {
        replacements: {
          dam_id, sire_identity, insemination_date, insemination_type: type,
          notes: notes || null, created_by: req.user.user_id,
        },
      }
    );

    const [record] = await sequelize.query('SELECT * FROM breeding_records WHERE id = :id', {
      replacements: { id: result.insertId || result },
    });

    res.status(201).json({ message: 'Insemination logged.', id: record[0].id, data: record[0] });
  } catch (error) {
    console.error('Log insemination error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { dam_id, pregnancy_confirmed, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (dam_id) { where += ' AND br.dam_id = :dam_id'; replacements.dam_id = dam_id; }
    if (pregnancy_confirmed !== undefined) { where += ' AND br.pregnancy_confirmed = :preg'; replacements.preg = pregnancy_confirmed === 'true' ? 1 : 0; }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [records] = await sequelize.query(
      `SELECT br.*, a.tag_number AS dam_tag, a.species AS dam_species
       FROM breeding_records br
       JOIN animals a ON br.dam_id = a.id
       ${where}
       ORDER BY br.insemination_date DESC
       LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM breeding_records br ${where}`,
      { replacements }
    );

    res.json({
      message: 'Breeding records retrieved.',
      data: records,
      pagination: { page: parseInt(page), limit: parseInt(limit), total: countResult[0].total, totalPages: Math.ceil(countResult[0].total / parseInt(limit)) },
    });
  } catch (error) {
    console.error('List breeding records error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const pregnancyCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const { pregnancy_confirmed, pregnancy_check_date } = req.body;

    const [records] = await sequelize.query(
      'SELECT br.*, a.species FROM breeding_records br JOIN animals a ON br.dam_id = a.id WHERE br.id = :id',
      { replacements: { id } }
    );

    if (records.length === 0) {
      return res.status(404).json({ error: 'Breeding record not found.' });
    }

    const record = records[0];

    if (record.pregnancy_confirmed) {
      return res.status(400).json({ error: 'Pregnancy already confirmed for this record.' });
    }

    if (record.actual_calving_date) {
      return res.status(400).json({ error: 'Calving already recorded for this breeding.' });
    }

    const isConfirmed = pregnancy_confirmed === true || pregnancy_confirmed === 'true';

    let estimatedCalvingDate = null;
    if (isConfirmed) {
      const checkDate = pregnancy_check_date || new Date().toISOString().split('T')[0];
      const gestation = GESTATION_DAYS[record.species] || 283;
      const calvingRaw = new Date(record.insemination_date);
      calvingRaw.setDate(calvingRaw.getDate() + gestation);
      estimatedCalvingDate = calvingRaw.toISOString().split('T')[0];

      await sequelize.query(
        'UPDATE animals SET status = :status WHERE id = :dam_id',
        { replacements: { status: 'Pregnant', dam_id: record.dam_id } }
      );
    }

    await sequelize.query(
      `UPDATE breeding_records SET pregnancy_confirmed = :confirmed, pregnancy_check_date = :check_date,
        estimated_calving_date = :ecd WHERE id = :id`,
      {
        replacements: {
          confirmed: isConfirmed ? 1 : 0,
          check_date: pregnancy_check_date || new Date().toISOString().split('T')[0],
          ecd: estimatedCalvingDate,
          id,
        },
      }
    );

    const [updated] = await sequelize.query('SELECT * FROM breeding_records WHERE id = :id', { replacements: { id } });

    res.json({ message: isConfirmed ? 'Pregnancy confirmed.' : 'Pregnancy not confirmed.', data: updated[0] });
  } catch (error) {
    console.error('Pregnancy check error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getBreedingHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const [records] = await sequelize.query(
      `SELECT br.*, a.tag_number AS dam_tag
       FROM breeding_records br
       JOIN animals a ON br.dam_id = a.id
       WHERE br.dam_id = :id
       ORDER BY br.insemination_date DESC`,
      { replacements: { id } }
    );

    res.json({ message: 'Breeding history retrieved.', data: records, total: records.length });
  } catch (error) {
    console.error('Breeding history error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { logInsemination, list, pregnancyCheck, getBreedingHistory };
