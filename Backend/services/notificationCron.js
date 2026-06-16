const cron = require('node-cron');
const { sequelize } = require('../config/database');
const { createAlert } = require('./alertService');

const runChecks = async () => {
  console.log(`[Cron] ${new Date().toISOString()} — Running notification checks...`);

  try {
    const today = new Date().toISOString().split('T')[0];
    const sevenDays = new Date();
    sevenDays.setDate(sevenDays.getDate() + 7);
    const in7days = sevenDays.toISOString().split('T')[0];

    const fourteenDays = new Date();
    fourteenDays.setDate(fourteenDays.getDate() + 14);
    const in14days = fourteenDays.toISOString().split('T')[0];

    const [calvingDue] = await sequelize.query(
      `SELECT br.*, a.tag_number FROM breeding_records br
       JOIN animals a ON br.dam_id = a.id
       WHERE br.pregnancy_confirmed = TRUE AND br.actual_calving_date IS NULL
         AND br.estimated_calving_date BETWEEN :today AND :in14days`,
      { replacements: { today, in14days } }
    );

    for (const record of calvingDue) {
      await createAlert({
        alert_type: 'CalvingDue',
        severity: 'Info',
        message: `Calving expected for ${record.tag_number} on ${record.estimated_calving_date?.split('T')[0] || 'soon'}.`,
        reference_entity_type: 'animal',
        reference_entity_id: record.dam_id,
      });
    }

    const [withdrawalEnding] = await sequelize.query(
      `SELECT hr.*, a.tag_number FROM health_records hr
       JOIN animals a ON hr.animal_id = a.id
       WHERE hr.withdrawal_end_date = :today`,
      { replacements: { today } }
    );

    for (const record of withdrawalEnding) {
      await sequelize.query(
        'UPDATE animals SET status = :status WHERE id = :id',
        { replacements: { status: 'Active', id: record.animal_id } }
      );
      await createAlert({
        alert_type: 'WithdrawalEnded',
        severity: 'Info',
        message: `Withdrawal period ended for ${record.tag_number}. Status changed to Active.`,
        reference_entity_type: 'animal',
        reference_entity_id: record.animal_id,
      });
    }

    const [lowStock] = await sequelize.query(
      'SELECT * FROM inventory WHERE reorder_threshold > 0 AND quantity <= reorder_threshold'
    );

    for (const item of lowStock) {
      await createAlert({
        alert_type: 'LowStock',
        severity: 'Warning',
        message: `Low stock: "${item.item_name}" has ${item.quantity} ${item.unit} (threshold: ${item.reorder_threshold}).`,
        reference_entity_type: 'inventory',
        reference_entity_id: item.id,
      });
    }

    const [vaccinationAnimals] = await sequelize.query(
      `SELECT a.id, a.tag_number, a.species, a.date_of_birth, vs.vaccine_name, vs.age_days
       FROM animals a
       CROSS JOIN vaccination_schedules vs
       WHERE (vs.target_species = a.species OR vs.target_species = 'All')
         AND vs.age_days IS NOT NULL
         AND a.date_of_birth IS NOT NULL
         AND DATE_ADD(a.date_of_birth, INTERVAL vs.age_days DAY) BETWEEN :today AND :in7days`,
      { replacements: { today, in7days } }
    );

    for (const vac of vaccinationAnimals) {
      await createAlert({
        alert_type: 'VaccinationDue',
        severity: 'Warning',
        message: `Vaccination "${vac.vaccine_name}" due for ${vac.tag_number} (${vac.species}) within 7 days.`,
        reference_entity_type: 'animal',
        reference_entity_id: vac.id,
      });
    }

    console.log(`[Cron] Checks complete — Calving: ${calvingDue.length}, Withdrawals: ${withdrawalEnding.length}, LowStock: ${lowStock.length}, Vaccinations: ${vaccinationAnimals.length}`);
  } catch (error) {
    console.error('[Cron] Error:', error);
  }
};

const startCron = () => {
  cron.schedule('0 6 * * *', runChecks, { timezone: 'Asia/Karachi' });
  console.log('[Cron] Notification cron initialized — daily at 06:00 PKT');
};

module.exports = { startCron, runChecks };
