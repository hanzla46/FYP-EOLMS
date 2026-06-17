const express = require('express');
const router = express.Router();
const { runChecks } = require('../services/notificationCron');

router.post('/daily', async (req, res) => {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = req.headers['x-cron-secret'] || req.body.secret;

  if (cronSecret && providedSecret !== cronSecret) {
    return res.status(403).json({ error: 'Invalid cron secret.' });
  }

  try {
    await runChecks();
    res.json({ message: 'Cron checks completed.' });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    res.status(500).json({ error: 'Cron checks failed.' });
  }
});

module.exports = router;
