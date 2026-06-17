-- EOLMS Database Schema
-- MySQL 8.0 / MariaDB (InnoDB)

CREATE DATABASE IF NOT EXISTS maher46_eolms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE maher46_eolms;

-- ============================================================
-- 1. users (no dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  full_name   VARCHAR(100) NOT NULL,
  role        ENUM('Admin','Vet','Worker') NOT NULL DEFAULT 'Worker',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- 2. inventory (no dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  item_name         VARCHAR(150) NOT NULL,
  category          ENUM('Medication','Feed','Equipment','Cleaning','Other') NOT NULL DEFAULT 'Other',
  quantity          DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit              VARCHAR(20)  NOT NULL,
  reorder_threshold DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit_price        DECIMAL(10,2),
  supplier          VARCHAR(150),
  notes             TEXT,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_inv_category (category),
  INDEX idx_inv_low_stock (quantity, reorder_threshold)
) ENGINE=InnoDB;

-- ============================================================
-- 3. animals (depends on users, self)
-- ============================================================
CREATE TABLE IF NOT EXISTS animals (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  tag_number          VARCHAR(20)  NOT NULL UNIQUE,
  rfid_tag            VARCHAR(50)  UNIQUE,
  species             ENUM('Cattle','Sheep','Goat') NOT NULL,
  breed               VARCHAR(100),
  gender              ENUM('Male','Female') NOT NULL,
  date_of_birth       DATE,
  dam_id              INT,
  sire_identity       VARCHAR(64),
  status              ENUM('Active','Quarantined','Deceased','Sold','Pregnant','Dry') NOT NULL DEFAULT 'Active',
  weight_kg           DECIMAL(8,2),
  color               VARCHAR(50),
  profile_photo_path  VARCHAR(255),
  notes               TEXT,
  created_by          INT NOT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_animals_species (species),
  INDEX idx_animals_status (status),
  INDEX idx_animals_gender (gender),
  INDEX idx_animals_breed (breed),
  INDEX idx_animals_dam_id (dam_id),

  CONSTRAINT fk_animals_dam
    FOREIGN KEY (dam_id) REFERENCES animals(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_animals_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. vaccination_schedules (depends on inventory)
-- ============================================================
CREATE TABLE IF NOT EXISTS vaccination_schedules (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  vaccine_name            VARCHAR(200) NOT NULL,
  target_species          ENUM('Cattle','Sheep','Goat','All') NOT NULL DEFAULT 'All',
  age_days                INT,
  booster_interval_days   INT,
  inventory_item_id       INT,
  notes                   TEXT,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_vs_species (target_species),
  INDEX idx_vs_inv (inventory_item_id),

  CONSTRAINT fk_vs_inv
    FOREIGN KEY (inventory_item_id) REFERENCES inventory(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. health_records (depends on animals, users, vaccination_schedules)
-- ============================================================
CREATE TABLE IF NOT EXISTS health_records (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  animal_id               INT NOT NULL,
  vet_id                  INT NOT NULL,
  record_date             DATE NOT NULL,
  diagnosis               VARCHAR(500),
  treatment               TEXT,
  medication_given        VARCHAR(200),
  medication_quantity     DECIMAL(10,2),
  medication_unit         VARCHAR(20),
  inventory_item_id       INT,
  vaccination_schedule_id INT,
  withdrawal_days         INT DEFAULT 0,
  withdrawal_end_date     DATE,
  notes                   TEXT,
  created_by              INT NOT NULL,
  created_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_hr_animal (animal_id),
  INDEX idx_hr_vet (vet_id),
  INDEX idx_hr_date (record_date),
  INDEX idx_hr_withdrawal (withdrawal_end_date),
  INDEX idx_hr_vs (vaccination_schedule_id),

  CONSTRAINT fk_hr_animal
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_vet
    FOREIGN KEY (vet_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_hr_vaccination
    FOREIGN KEY (vaccination_schedule_id) REFERENCES vaccination_schedules(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. breeding_records (depends on animals, users)
-- ============================================================
CREATE TABLE IF NOT EXISTS breeding_records (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  dam_id                 INT NOT NULL,
  sire_identity          VARCHAR(64) NOT NULL,
  insemination_date      DATE NOT NULL,
  insemination_type      ENUM('Natural','AI') NOT NULL DEFAULT 'Natural',
  pregnancy_confirmed    BOOLEAN NOT NULL DEFAULT FALSE,
  pregnancy_check_date   DATE,
  estimated_calving_date DATE,
  actual_calving_date    DATE,
  offspring_count        INT DEFAULT 0,
  notes                  TEXT,
  created_by             INT NOT NULL,
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_br_dam (dam_id),
  INDEX idx_br_expected_calving (estimated_calving_date),
  INDEX idx_br_pregnancy (pregnancy_confirmed),

  CONSTRAINT fk_br_dam
    FOREIGN KEY (dam_id) REFERENCES animals(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_br_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. production_logs (depends on animals, users)
-- ============================================================
CREATE TABLE IF NOT EXISTS production_logs (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  animal_id       INT NOT NULL,
  log_date        DATE NOT NULL,
  production_type ENUM('Milk','Weight','Wool') NOT NULL,
  quantity        DECIMAL(10,2) NOT NULL,
  unit            VARCHAR(20) NOT NULL,
  notes           TEXT,
  created_by      INT NOT NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_pl_animal (animal_id),
  INDEX idx_pl_date (log_date),
  INDEX idx_pl_type (production_type),

  CONSTRAINT fk_pl_animal
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pl_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 8. financial_ledger (depends on users)
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_ledger (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  transaction_date      DATE NOT NULL,
  transaction_type      ENUM('Income','Expense') NOT NULL,
  category              ENUM('Feed','Medication','Breeding','Equipment','Labor','Sales','Other') NOT NULL,
  amount                DECIMAL(10,2) NOT NULL,
  description           VARCHAR(500),
  reference_entity_type VARCHAR(50),
  reference_entity_id   INT,
  created_by            INT NOT NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_fl_date (transaction_date),
  INDEX idx_fl_type (transaction_type),
  INDEX idx_fl_category (category),

  CONSTRAINT fk_fl_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. system_alerts (no dependencies)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_alerts (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  alert_type            VARCHAR(50)  NOT NULL,
  severity              ENUM('Info','Warning','Critical') NOT NULL DEFAULT 'Info',
  message               TEXT NOT NULL,
  reference_entity_type VARCHAR(50),
  reference_entity_id   INT,
  is_read               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_sa_type (alert_type),
  INDEX idx_sa_severity (severity),
  INDEX idx_sa_unread (is_read),
  INDEX idx_sa_created (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 10. attachments (depends on users)
-- ============================================================
CREATE TABLE IF NOT EXISTS attachments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  entity_type   VARCHAR(50) NOT NULL,
  entity_id     INT NOT NULL,
  filename      VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type     VARCHAR(100),
  file_size     INT,
  file_data     LONGBLOB,
  uploaded_by   INT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_att_entity (entity_type, entity_id),

  CONSTRAINT fk_att_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;
