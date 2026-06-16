const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

const uploadAnimalPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const [animals] = await sequelize.query('SELECT * FROM animals WHERE id = :id', { replacements: { id } });

    if (animals.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Animal not found.' });
    }

    const animal = animals[0];

    if (animal.profile_photo_path) {
      const oldPath = path.join('uploads', animal.profile_photo_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await sequelize.query(
      'UPDATE animals SET profile_photo_path = :photo_path WHERE id = :id',
      { replacements: { photo_path: req.file.filename, id } }
    );

    await sequelize.query(
      `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, uploaded_by)
       VALUES ('animal', :entity_id, :filename, :original_name, :mime_type, :file_size, :uploaded_by)`,
      {
        replacements: {
          entity_id: id,
          filename: req.file.filename,
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          file_size: req.file.size,
          uploaded_by: req.user.user_id,
        },
      }
    );

    res.json({ message: 'Photo uploaded.', filename: req.file.filename, path: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Upload animal photo error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const uploadHealthDocument = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const [records] = await sequelize.query('SELECT * FROM health_records WHERE id = :id', { replacements: { id } });

    if (records.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Health record not found.' });
    }

    await sequelize.query(
      `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, uploaded_by)
       VALUES ('health_record', :entity_id, :filename, :original_name, :mime_type, :file_size, :uploaded_by)`,
      {
        replacements: {
          entity_id: id,
          filename: req.file.filename,
          original_name: req.file.originalname,
          mime_type: req.file.mimetype,
          file_size: req.file.size,
          uploaded_by: req.user.user_id,
        },
      }
    );

    res.json({ message: 'Document uploaded.', filename: req.file.filename, path: `/uploads/${req.file.filename}` });
  } catch (error) {
    console.error('Upload health document error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const serveFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(filename));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { uploadAnimalPhoto, uploadHealthDocument, serveFile };
