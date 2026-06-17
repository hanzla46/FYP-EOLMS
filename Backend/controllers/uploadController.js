const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

const isVercel = process.env.VERCEL === '1';

const uploadAnimalPhoto = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const [animals] = await sequelize.query('SELECT * FROM animals WHERE id = :id', { replacements: { id } });

    if (animals.length === 0) {
      if (!isVercel && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Animal not found.' });
    }

    const animal = animals[0];
    const filename = req.file.originalname;

    if (!isVercel && animal.profile_photo_path) {
      const oldPath = path.join('uploads', animal.profile_photo_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const photoPath = isVercel ? `db://${filename}` : req.file.filename;
    await sequelize.query(
      'UPDATE animals SET profile_photo_path = :photo_path WHERE id = :id',
      { replacements: { photo_path: photoPath, id } }
    );

    const fileBuffer = req.file.buffer || null;

    try {
      await sequelize.query(
        `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, file_data, uploaded_by)
         VALUES ('animal', :entity_id, :filename, :original_name, :mime_type, :file_size, :file_data, :uploaded_by)`,
        {
          replacements: {
            entity_id: id,
            filename: photoPath,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            file_data: fileBuffer,
            uploaded_by: req.user.user_id,
          },
        }
      );
    } catch (insertErr) {
      if (insertErr.original && insertErr.original.code === 'ER_BAD_FIELD_ERROR') {
        await sequelize.query(
          `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, uploaded_by)
           VALUES ('animal', :entity_id, :filename, :original_name, :mime_type, :file_size, :uploaded_by)`,
          {
            replacements: { entity_id: id, filename: photoPath, original_name: req.file.originalname, mime_type: req.file.mimetype, file_size: req.file.size, uploaded_by: req.user.user_id },
          }
        );
      } else {
        throw insertErr;
      }
    }

    res.json({ message: 'Photo uploaded.', filename: photoPath, path: `/api/v1/uploads/file/${id}?type=animal` });
  } catch (error) {
    console.error('Upload animal photo error:', error);
    if (!isVercel && req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
      if (!isVercel && req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Health record not found.' });
    }

    const filename = isVercel ? `db://${req.file.originalname}` : req.file.originalname;
    const fileBuffer = req.file.buffer || null;

    try {
      await sequelize.query(
        `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, file_data, uploaded_by)
         VALUES ('health_record', :entity_id, :filename, :original_name, :mime_type, :file_size, :file_data, :uploaded_by)`,
        {
          replacements: {
            entity_id: id,
            filename,
            original_name: req.file.originalname,
            mime_type: req.file.mimetype,
            file_size: req.file.size,
            file_data: fileBuffer,
            uploaded_by: req.user.user_id,
          },
        }
      );
    } catch (insertErr) {
      if (insertErr.original && insertErr.original.code === 'ER_BAD_FIELD_ERROR') {
        await sequelize.query(
          `INSERT INTO attachments (entity_type, entity_id, filename, original_name, mime_type, file_size, uploaded_by)
           VALUES ('health_record', :entity_id, :filename, :original_name, :mime_type, :file_size, :uploaded_by)`,
          {
            replacements: { entity_id: id, filename, original_name: req.file.originalname, mime_type: req.file.mimetype, file_size: req.file.size, uploaded_by: req.user.user_id },
          }
        );
      } else {
        throw insertErr;
      }
    }

    res.json({ message: 'Document uploaded.', filename, path: `/api/v1/uploads/file/${id}?type=health_record` });
  } catch (error) {
    console.error('Upload health document error:', error);
    if (!isVercel && req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

const serveFile = async (req, res) => {
  try {
    const { entity_type, entity_id } = req.query;

    if (isVercel || entity_type) {
      const where = entity_type && entity_id
        ? 'WHERE entity_type = :type AND entity_id = :eid'
        : 'WHERE filename = :fname';
      const replacements = entity_type && entity_id
        ? { type: entity_type, eid: entity_id }
        : { fname: req.params.filename };

      const [attachments] = await sequelize.query(
        `SELECT * FROM attachments ${where} ORDER BY created_at DESC LIMIT 1`,
        { replacements }
      );

      if (attachments.length > 0 && attachments[0].file_data) {
        res.set('Content-Type', attachments[0].mime_type || 'application/octet-stream');
        res.set('Content-Disposition', `inline; filename="${attachments[0].original_name}"`);
        return res.send(attachments[0].file_data);
      }
    }

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
