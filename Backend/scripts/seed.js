require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const users = [
  { username: 'admin', email: 'admin@eolms.local', password: 'admin123', full_name: 'Farm Administrator', role: 'Admin' },
  { username: 'vet_sarah', email: 'sarah@eolms.local', password: 'vet123', full_name: 'Dr. Sarah Khan', role: 'Vet' },
  { username: 'vet_ahmed', email: 'ahmed@eolms.local', password: 'vet123', full_name: 'Dr. Ahmed Ali', role: 'Vet' },
  { username: 'worker_ali', email: 'ali@eolms.local', password: 'worker123', full_name: 'Ali Hassan', role: 'Worker' },
  { username: 'worker_bilal', email: 'bilal@eolms.local', password: 'worker123', full_name: 'Bilal Mahmood', role: 'Worker' },
  { username: 'worker_fatima', email: 'fatima@eolms.local', password: 'worker123', full_name: 'Fatima Noor', role: 'Worker' },
];

const cattleBreeds = ['Holstein', 'Jersey', 'Angus', 'Hereford', 'Brahman', 'Charolais', 'Simmental', 'Sahiwal'];
const sheepBreeds = ['Merino', 'Suffolk', 'Dorper', 'Karakul', 'Kajli'];
const goatBreeds = ['Beetal', 'Nubian', 'Saanen', 'Boer', 'Kamori'];
const colors = ['Black and White', 'Brown', 'Red', 'White', 'Black', 'Spotted', 'Gray', 'Tan'];
const tagYears = ['24', '25', '26'];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[random(0, arr.length - 1)];
const dateStr = (date) => date.toISOString().split('T')[0];

const seed = async (calledFromSetup = false) => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.\n');

    const force = process.argv.includes('--force') || process.argv.includes('-f');
    const [[{ count }]] = await sequelize.query('SELECT COUNT(*) AS count FROM users');

    if (count > 0 && !force) {
      console.log('Database already has data. Use --force to re-seed (WARNING: destroys all data).');
      if (!calledFromSetup) process.exit(0);
      return;
    }

    console.log('Clearing existing data...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('TRUNCATE TABLE attachments');
    await sequelize.query('TRUNCATE TABLE system_alerts');
    await sequelize.query('TRUNCATE TABLE production_logs');
    await sequelize.query('TRUNCATE TABLE financial_ledger');
    await sequelize.query('TRUNCATE TABLE health_records');
    await sequelize.query('TRUNCATE TABLE breeding_records');
    await sequelize.query('TRUNCATE TABLE inventory');
    await sequelize.query('TRUNCATE TABLE vaccination_schedules');
    await sequelize.query('TRUNCATE TABLE animals');
    await sequelize.query('TRUNCATE TABLE users');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('All tables cleared.\n');

    console.log('Seeding users...');
    let userId = 0;
    for (const user of users) {
      const pw = await bcrypt.hash(user.password, 10);
      await sequelize.query(
        'INSERT INTO users (username, email, password, full_name, role) VALUES (:u, :e, :p, :f, :r)',
        { replacements: { u: user.username, e: user.email, p: pw, f: user.full_name, r: user.role } }
      );
      userId++;
      console.log(`  [${userId}] ${user.full_name} (${user.role})`);
    }
    const adminId = 1, vetSarahId = 2, vetAhmedId = 3, aliId = 4, bilalId = 5, fatimaId = 6;

    console.log('Seeding animals (~100)...');
    const animalIds = [];
    const speciesDist = [{ species: 'Cattle', count: 60, breeds: cattleBreeds }, { species: 'Sheep', count: 25, breeds: sheepBreeds }, { species: 'Goat', count: 15, breeds: goatBreeds }];

    for (const dist of speciesDist) {
      for (let i = 0; i < dist.count; i++) {
        const species = dist.species;
        const prefix = species === 'Cattle' ? 'LIV' : species === 'Sheep' ? 'SH' : 'GT';
        const year = pick(tagYears);
        const num = String(random(10000, 99999));
        const tag = `${prefix}-${year}-${num}`;
        const gender = Math.random() > 0.15 ? 'Female' : 'Male';
        const dob = new Date(2020 + random(0, 6), random(0, 11), random(1, 28));
        const weight = species === 'Cattle' ? random(300, 750) : species === 'Sheep' ? random(30, 90) : random(20, 70);
        const createdBy = pick([adminId, vetSarahId, vetAhmedId]);

        await sequelize.query(
          `INSERT INTO animals (tag_number, species, breed, gender, date_of_birth, weight_kg, color, created_by)
           VALUES (:tag, :species, :breed, :gender, :dob, :weight, :color, :cb)`,
          { replacements: { tag, species, breed: pick(dist.breeds), gender, dob: dateStr(dob), weight, color: pick(colors), cb: createdBy } }
        );

        const [newAnimal] = await sequelize.query('SELECT LAST_INSERT_ID() AS id');
        const aId = newAnimal[0].id;
        animalIds.push(aId);

        if ((i + 1) % 20 === 0) console.log(`  Created ${i + 1} ${species}...`);
      }
    }
    console.log(`  Total animals created: ${animalIds.length}`);

    // Set lineage for ~30 animals
    console.log('Setting lineage relationships...');
    const females = [];
    const males = [];
    for (const aId of animalIds) {
      const [a] = await sequelize.query('SELECT id, gender, species FROM animals WHERE id = :id', { replacements: { id: aId } });
      if (a[0].gender === 'Female') females.push(a[0]);
      else males.push(a[0]);
    }

    for (let i = 0; i < 30; i++) {
      const mother = pick(females);
      const [existingDam] = await sequelize.query('SELECT id FROM animals WHERE dam_id = :did', { replacements: { did: mother.id } });
      if (existingDam.length < 2) {
        const eligible = animalIds.filter(id => id !== mother.id);
        const childId = pick(eligible);
        if (childId) {
          const sireId = `External Bull #${random(1, 50)}`;
          await sequelize.query(
            'UPDATE animals SET dam_id = :dam_id WHERE id = :id AND id != :dam_id',
            { replacements: { dam_id: mother.id, id: childId } }
          );
        }
      }
    }

    console.log('Seeding inventory...');
    const inventoryItems = [
      { name: 'Ivermectin 1%', cat: 'Medication', qty: 500, unit: 'ml', thresh: 100, price: 250 },
      { name: 'Penicillin Injection', cat: 'Medication', qty: 300, unit: 'ml', thresh: 50, price: 180 },
      { name: 'Oxytocin', cat: 'Medication', qty: 100, unit: 'ml', thresh: 20, price: 350 },
      { name: 'Calcium Bolus', cat: 'Medication', qty: 200, unit: 'pcs', thresh: 40, price: 45 },
      { name: 'Vaccine FMD', cat: 'Medication', qty: 1000, unit: 'doses', thresh: 200, price: 120 },
      { name: 'Cattle Feed Pellets', cat: 'Feed', qty: 2000, unit: 'kg', thresh: 500, price: 85 },
      { name: 'Mineral Mix', cat: 'Feed', qty: 500, unit: 'kg', thresh: 100, price: 150 },
      { name: 'Hay Bales', cat: 'Feed', qty: 300, unit: 'bales', thresh: 50, price: 1200 },
      { name: 'Milking Machine Parts', cat: 'Equipment', qty: 15, unit: 'sets', thresh: 5, price: 8500 },
      { name: 'Syringes 10ml', cat: 'Equipment', qty: 500, unit: 'pcs', thresh: 100, price: 15 },
      { name: 'Disinfectant', cat: 'Cleaning', qty: 50, unit: 'L', thresh: 10, price: 450 },
      { name: 'Ear Tags', cat: 'Equipment', qty: 200, unit: 'pcs', thresh: 50, price: 25 },
    ];

    const invIds = [];
    for (const item of inventoryItems) {
      await sequelize.query(
        `INSERT INTO inventory (item_name, category, quantity, unit, reorder_threshold, unit_price, supplier)
         VALUES (:n, :c, :q, :u, :t, :p, :s)`,
        { replacements: { n: item.name, c: item.cat, q: item.qty, u: item.unit, t: item.thresh, p: item.price, s: 'AgriSupply Ltd' } }
      );
      const [newInv] = await sequelize.query('SELECT LAST_INSERT_ID() AS id');
      invIds.push(newInv[0].id);
    }
    console.log(`  Created ${inventoryItems.length} inventory items`);

    console.log('Seeding vaccination schedules...');
    const vaccineInvId = invIds[4]; // Vaccine FMD inventory item
    const schedules = [
      { name: 'FMD Vaccine', species: 'Cattle', age: 90, booster: 180, inv: vaccineInvId },
      { name: 'FMD Vaccine', species: 'Sheep', age: 90, booster: 180, inv: vaccineInvId },
      { name: 'FMD Vaccine', species: 'Goat', age: 90, booster: 180, inv: vaccineInvId },
      { name: 'Anthrax Vaccine', species: 'All', age: 180, booster: 365, inv: null },
      { name: 'Brucellosis Vaccine', species: 'Cattle', age: 120, booster: null, inv: null },
      { name: 'PPR Vaccine', species: 'Goat', age: 90, booster: 365, inv: null },
      { name: 'PPR Vaccine', species: 'Sheep', age: 90, booster: 365, inv: null },
    ];
    for (const s of schedules) {
      await sequelize.query(
        `INSERT INTO vaccination_schedules (vaccine_name, target_species, age_days, booster_interval_days, inventory_item_id)
         VALUES (:n, :s, :a, :b, :inv)`,
        { replacements: { n: s.name, s: s.species, a: s.age, b: s.booster, inv: s.inv } }
      );
    }
    console.log(`  Created ${schedules.length} vaccination schedules`);

    console.log('Seeding health records...');
    const diagnoses = ['Mastitis', 'Foot Rot', 'Bloat', 'Pneumonia', 'Anthrax suspected', 'Wound', 'Diarrhea', 'Milk Fever', 'Ketosis', 'Laminitis'];
    let hrCount = 0;
    for (let i = 0; i < 35; i++) {
      const aId = pick(animalIds);
      const vetId = pick([vetSarahId, vetAhmedId]);
      const date = new Date(2026, 0, 1);
      date.setDate(date.getDate() + random(0, 165));
      const wd = Math.random() > 0.6 ? random(3, 21) : 0;
      const invItem = invIds[0]; // Ivermectin

      await sequelize.query(
        `INSERT INTO health_records (animal_id, vet_id, record_date, diagnosis, treatment, medication_given, medication_quantity, medication_unit, inventory_item_id, withdrawal_days, withdrawal_end_date, created_by)
         VALUES (:aid, :vid, :dt, :diag, :trt, :med, :mqty, :mu, :iid, :wd, :wde, :cb)`,
        {
          replacements: {
            aid: aId, vid: vetId, dt: dateStr(date), diag: pick(diagnoses),
            trt: 'Administered treatment and monitoring.', med: 'Ivermectin 1%', mqty: random(5, 30),
            mu: 'ml', iid: invItem, wd, wde: wd > 0 ? dateStr(new Date(date.getTime() + wd * 86400000)) : null,
            cb: vetId,
          },
        }
      );
      hrCount++;
    }

    // Add 5 vaccination records linked to FMD schedule (vaccination_schedule_id = 1)
    for (let i = 0; i < 5; i++) {
      const aId = pick(animalIds);
      const vetId = pick([vetSarahId, vetAhmedId]);
      const date = new Date(2026, 0, 1);
      date.setDate(date.getDate() + random(0, 165));

      await sequelize.query(
        `INSERT INTO health_records (animal_id, vet_id, record_date, diagnosis, treatment, medication_given, medication_quantity, medication_unit, inventory_item_id, vaccination_schedule_id, withdrawal_days, created_by)
         VALUES (:aid, :vid, :dt, 'FMD Vaccination', 'Administered FMD vaccine per schedule.', 'Vaccine FMD', :mqty, 'doses', :iid, :vsid, 0, :cb)`,
        {
          replacements: {
            aid: aId, vid: vetId, dt: dateStr(date), mqty: 1, iid: vaccineInvId, vsid: 1, cb: vetId,
          },
        }
      );
      hrCount++;
    }
    console.log(`  Created ${hrCount} health records`);

    console.log('Seeding breeding records...');
    let brCount = 0;
    for (let i = 0; i < 25; i++) {
      const mother = pick(females);
      const [active] = await sequelize.query('SELECT id FROM breeding_records WHERE dam_id = :did AND pregnancy_confirmed = TRUE AND actual_calving_date IS NULL', { replacements: { did: mother.id } });
      if (active.length > 0) continue;

      const insemDate = new Date(2025, 6, 1);
      insemDate.setDate(insemDate.getDate() + random(0, 300));
      const confirmed = insemDate < new Date(2026, 5, 1) && Math.random() > 0.15;

      const gestation = mother.species === 'Cattle' ? 283 : 150;
      let ecd = null;
      if (confirmed) {
        ecd = new Date(insemDate);
        ecd.setDate(ecd.getDate() + gestation);
      }

      await sequelize.query(
        `INSERT INTO breeding_records (dam_id, sire_identity, insemination_date, insemination_type, pregnancy_confirmed, pregnancy_check_date, estimated_calving_date, created_by)
         VALUES (:did, :sire, :dt, :type, :preg, :chk, :ecd, :cb)`,
        {
          replacements: {
            did: mother.id, sire: `External Bull #${random(1, 50)}`, dt: dateStr(insemDate),
            type: pick(['Natural', 'AI']), preg: confirmed ? 1 : 0,
            chk: confirmed ? dateStr(new Date(insemDate.getTime() + 30 * 86400000)) : null,
            ecd: ecd ? dateStr(ecd) : null, cb: vetAhmedId,
          },
        }
      );
      brCount++;
    }
    console.log(`  Created ${brCount} breeding records`);

    console.log('Seeding production logs...');
    let plCount = 0;
    for (let i = 0; i < 80; i++) {
      const aId = pick(animalIds);
      const date = new Date(2026, 5, 1);
      date.setDate(date.getDate() - random(0, 30));
      const type = pick(['Milk', 'Weight', 'Wool']);
      const qty = type === 'Milk' ? (Math.random() * 25 + 5).toFixed(1) : type === 'Weight' ? random(25, 700) : random(1, 5);

      await sequelize.query(
        `INSERT INTO production_logs (animal_id, log_date, production_type, quantity, unit, created_by)
         VALUES (:aid, :dt, :type, :qty, :unit, :cb)`,
        { replacements: { aid: aId, dt: dateStr(date), type, qty, unit: type === 'Milk' ? 'L' : 'kg', cb: pick([aliId, bilalId, fatimaId]) } }
      );
      plCount++;
    }
    console.log(`  Created ${plCount} production logs`);

    console.log('Seeding financial transactions...');
    let txCount = 0;
    const expenseTypes = [
      { cat: 'Feed', amt: [5000, 15000], desc: 'Monthly feed purchase' },
      { cat: 'Medication', amt: [2000, 8000], desc: 'Veterinary supplies' },
      { cat: 'Labor', amt: [15000, 40000], desc: 'Staff salaries' },
      { cat: 'Equipment', amt: [5000, 30000], desc: 'Equipment maintenance' },
      { cat: 'Breeding', amt: [3000, 12000], desc: 'AI supplies' },
    ];
    for (let m = 1; m <= 6; m++) {
      for (const e of expenseTypes) {
        await sequelize.query(
          `INSERT INTO financial_ledger (transaction_date, transaction_type, category, amount, description, created_by)
           VALUES (:dt, 'Expense', :cat, :amt, :desc, :cb)`,
          { replacements: { dt: `2026-${String(m).padStart(2, '0')}-01`, cat: e.cat, amt: random(e.amt[0], e.amt[1]), desc: e.desc, cb: adminId } }
        );
        txCount++;
      }
      // Income per month
      await sequelize.query(
        `INSERT INTO financial_ledger (transaction_date, transaction_type, category, amount, description, created_by)
         VALUES (:dt, 'Income', 'Sales', :amt, :desc, :cb)`,
        { replacements: { dt: `2026-${String(m).padStart(2, '0')}-15`, amt: random(20000, 60000), desc: 'Milk & livestock sales', cb: adminId } }
      );
      txCount++;
    }
    console.log(`  Created ${txCount} financial transactions`);

    console.log('\n=== Seed Complete ===');
    console.log(`Users:     ${users.length}`);
    console.log(`Animals:   ${animalIds.length}`);
    console.log(`Inventory: ${inventoryItems.length}`);
    console.log(`Health:    ${hrCount}`);
    console.log(`Breeding:  ${brCount}`);
    console.log(`Production:${plCount}`);
    console.log(`Finance:   ${txCount}`);
    console.log('\nLogin credentials:');
    console.log('  Admin:   admin@eolms.local / admin123');
    console.log('  Vet:     sarah@eolms.local / vet123');
    console.log('  Worker:  ali@eolms.local / worker123');

    if (calledFromSetup) return;
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    if (calledFromSetup) throw error;
    process.exit(1);
  }
};

module.exports = seed;

if (require.main === module) seed();
