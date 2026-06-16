const { sequelize } = require('../config/database');

const generateTagNumber = (species) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = species === 'Cattle' ? 'LIV' : species === 'Sheep' ? 'SH' : 'GT';
  return `${prefix}-${year}-${Math.floor(Math.random() * 90000) + 10000}`;
};

const generateUniqueTag = async (species, transaction) => {
  let tag;
  let exists = true;
  while (exists) {
    tag = generateTagNumber(species);
    const [rows] = await sequelize.query(
      'SELECT id FROM animals WHERE tag_number = :tag',
      { replacements: { tag }, transaction }
    );
    exists = rows.length > 0;
  }
  return tag;
};

const register = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { rfid_tag, species, breed, gender, date_of_birth, dam_id, sire_identity, weight_kg, color, notes } = req.body;

    if (!species || !gender) {
      await t.rollback();
      return res.status(400).json({ error: 'Species and gender are required.' });
    }

    const validSpecies = ['Cattle', 'Sheep', 'Goat'];
    if (!validSpecies.includes(species)) {
      await t.rollback();
      return res.status(400).json({ error: `Invalid species. Must be: ${validSpecies.join(', ')}.` });
    }

    const validGenders = ['Male', 'Female'];
    if (!validGenders.includes(gender)) {
      await t.rollback();
      return res.status(400).json({ error: `Invalid gender. Must be: ${validGenders.join(', ')}.` });
    }

    if (rfid_tag) {
      const [existing] = await sequelize.query(
        'SELECT id FROM animals WHERE rfid_tag = :rfid',
        { replacements: { rfid: rfid_tag }, transaction: t }
      );
      if (existing.length > 0) {
        await t.rollback();
        return res.status(400).json({ error: 'RFID tag already assigned to another animal.' });
      }
    }

    const tag_number = await generateUniqueTag(species, t);

    if (dam_id) {
      const [dams] = await sequelize.query(
        'SELECT id, gender FROM animals WHERE id = :dam_id',
        { replacements: { dam_id }, transaction: t }
      );
      if (dams.length === 0) {
        await t.rollback();
        return res.status(400).json({ error: 'Dam (mother) not found.' });
      }
      if (dams[0].gender !== 'Female') {
        await t.rollback();
        return res.status(400).json({ error: 'Dam must be a Female animal.' });
      }
    }

    if (sire_identity) {
      const sireTagMatch = sire_identity.match(/^(LIV|SH|GT)-\d{2}-\d{5}$/);
      if (sireTagMatch) {
        const [sires] = await sequelize.query(
          'SELECT id, gender FROM animals WHERE tag_number = :sire_identity',
          { replacements: { sire_identity }, transaction: t }
        );
        if (sires.length > 0 && sires[0].gender !== 'Male') {
          await t.rollback();
          return res.status(400).json({ error: 'Registered sire must be a Male animal.' });
        }
      }
    }

    let status = 'Active';
    if (species === 'Cattle' && gender === 'Female' && dam_id) {
    }

    const [result] = await sequelize.query(
      `INSERT INTO animals (tag_number, rfid_tag, species, breed, gender, date_of_birth, dam_id, sire_identity,
        weight_kg, color, notes, created_by)
       VALUES (:tag_number, :rfid_tag, :species, :breed, :gender, :date_of_birth, :dam_id, :sire_identity,
        :weight_kg, :color, :notes, :created_by)`,
      {
        replacements: {
          tag_number, rfid_tag: rfid_tag || null, species, breed: breed || null,
          gender, date_of_birth: date_of_birth || null, dam_id: dam_id || null,
          sire_identity: sire_identity || null, weight_kg: weight_kg || null,
          color: color || null, notes: notes || null, created_by: req.user.user_id,
        },
        transaction: t,
      }
    );

    await t.commit();

    const [animal] = await sequelize.query(
      'SELECT * FROM animals WHERE id = :id',
      { replacements: { id: result.insertId || result } }
    );

    res.status(201).json({ message: 'Animal registered.', id: animal[0].id, data: animal[0] });
  } catch (error) {
    await t.rollback();
    console.error('Register animal error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const list = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, species, breed, gender, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE 1=1';
    const replacements = {};

    if (status) {
      where += ' AND a.status = :status';
      replacements.status = status;
    }
    if (species) {
      where += ' AND a.species = :species';
      replacements.species = species;
    }
    if (breed) {
      where += ' AND a.breed = :breed';
      replacements.breed = breed;
    }
    if (gender) {
      where += ' AND a.gender = :gender';
      replacements.gender = gender;
    }
    if (search) {
      where += ' AND (a.tag_number LIKE :search OR a.breed LIKE :search OR a.color LIKE :search)';
      replacements.search = `%${search}%`;
    }

    replacements.limit = parseInt(limit);
    replacements.offset = offset;

    const [animals] = await sequelize.query(
      `SELECT a.*, u.full_name AS created_by_name
       FROM animals a
       LEFT JOIN users u ON a.created_by = u.id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT :limit OFFSET :offset`,
      { replacements }
    );

    const [countResult] = await sequelize.query(
      `SELECT COUNT(*) AS total FROM animals a ${where}`,
      { replacements }
    );

    res.json({
      message: 'Animals retrieved.',
      data: animals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('List animals error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const [animals] = await sequelize.query(
      `SELECT a.*, u.full_name AS created_by_name,
        dam.tag_number AS dam_tag,
        (SELECT COUNT(*) FROM health_records WHERE animal_id = a.id) AS health_record_count,
        (SELECT COUNT(*) FROM breeding_records WHERE dam_id = a.id) AS breeding_record_count,
        (SELECT COUNT(*) FROM production_logs WHERE animal_id = a.id) AS production_log_count
       FROM animals a
       LEFT JOIN users u ON a.created_by = u.id
       LEFT JOIN animals dam ON a.dam_id = dam.id
       WHERE a.id = :id`,
      { replacements: { id } }
    );

    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal not found.' });
    }

    res.json({ message: 'Animal retrieved.', data: animals[0] });
  } catch (error) {
    console.error('Get animal error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { breed, date_of_birth, dam_id, sire_identity, weight_kg, color, notes, rfid_tag } = req.body;

    const [animals] = await sequelize.query(
      'SELECT * FROM animals WHERE id = :id',
      { replacements: { id } }
    );

    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal not found.' });
    }

    if (rfid_tag) {
      const [existing] = await sequelize.query(
        'SELECT id FROM animals WHERE rfid_tag = :rfid AND id != :id',
        { replacements: { rfid: rfid_tag, id } }
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'RFID tag already assigned to another animal.' });
      }
    }

    if (dam_id) {
      const [dams] = await sequelize.query(
        'SELECT id, gender FROM animals WHERE id = :dam_id',
        { replacements: { dam_id } }
      );
      if (dams.length === 0) {
        return res.status(400).json({ error: 'Dam not found.' });
      }
      if (dams[0].gender !== 'Female') {
        return res.status(400).json({ error: 'Dam must be a Female animal.' });
      }
    }

    const fields = [];
    const replacements = { id };

    const updatableFields = { breed, date_of_birth, dam_id, sire_identity, weight_kg, color, notes, rfid_tag };
    for (const [key, value] of Object.entries(updatableFields)) {
      if (value !== undefined) {
        fields.push(`${key} = :${key}`);
        replacements[key] = value;
      }
    }

    if (fields.length > 0) {
      await sequelize.query(
        `UPDATE animals SET ${fields.join(', ')} WHERE id = :id`,
        { replacements }
      );
    }

    const [updated] = await sequelize.query(
      'SELECT * FROM animals WHERE id = :id',
      { replacements: { id } }
    );

    res.json({ message: 'Animal updated.', data: updated[0] });
  } catch (error) {
    console.error('Update animal error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Active', 'Quarantined', 'Deceased', 'Sold', 'Pregnant', 'Dry'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}.` });
    }

    const [animals] = await sequelize.query(
      'SELECT * FROM animals WHERE id = :id',
      { replacements: { id } }
    );

    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal not found.' });
    }

    const currentStatus = animals[0].status;

    if (currentStatus === status) {
      return res.status(400).json({ error: `Animal is already ${status}.` });
    }

    if (currentStatus === 'Deceased' || currentStatus === 'Sold') {
      return res.status(400).json({ error: `Cannot change status of ${currentStatus.toLowerCase()} animal.` });
    }

    if (status === 'Pregnant' && animals[0].gender !== 'Female') {
      return res.status(400).json({ error: 'Only female animals can be marked Pregnant.' });
    }

    if (status === 'Dry' && animals[0].gender !== 'Female') {
      return res.status(400).json({ error: 'Only female animals can be marked Dry.' });
    }

    await sequelize.query(
      'UPDATE animals SET status = :status WHERE id = :id',
      { replacements: { status, id } }
    );

    res.json({ message: `Animal status updated to ${status}.`, data: { id: parseInt(id), status } });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const getBreeds = async (req, res) => {
  try {
    const { species } = req.query;
    let where = "WHERE breed IS NOT NULL AND breed != ''";
    const replacements = {};
    if (species) { where += ' AND species = :species'; replacements.species = species; }

    const [breeds] = await sequelize.query(
      `SELECT DISTINCT breed FROM animals ${where} ORDER BY breed ASC`,
      { replacements }
    );

    res.json({ message: 'Breeds retrieved.', data: breeds.map(b => b.breed) });
  } catch (error) {
    console.error('Get breeds error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { register, list, getById, update, updateStatus, getBreeds };