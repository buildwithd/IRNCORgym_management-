-- =====================================================
-- GYM MANAGEMENT SYSTEM  |  1_schema.sql  (MySQL 8)
-- Run order: 1_schema.sql -> 2_data.sql -> 3_queries.sql
-- =====================================================
DROP DATABASE IF EXISTS gym_db;
CREATE DATABASE gym_db;
USE gym_db;

-- ---------- Admins ----------
CREATE TABLE Admins (
  admin_id   VARCHAR(10) PRIMARY KEY,
  username   VARCHAR(30) NOT NULL UNIQUE,
  password   VARCHAR(60) NOT NULL
);

-- ---------- Trainers ----------
CREATE TABLE Trainers (
  trainer_id     VARCHAR(10) PRIMARY KEY,
  name           VARCHAR(50) NOT NULL,
  phone          CHAR(10)    NOT NULL UNIQUE,
  specialization VARCHAR(40) NOT NULL,
  CONSTRAINT chk_trainer_phone CHECK (phone REGEXP '^[0-9]{10}$')
);

-- ---------- Members ----------
CREATE TABLE Members (
  member_id   VARCHAR(10) PRIMARY KEY,
  name        VARCHAR(50) NOT NULL,
  phone       CHAR(10)    NOT NULL UNIQUE,
  email       VARCHAR(60),
  gender      ENUM('Male','Female','Other') NOT NULL,
  joined_date DATE        NOT NULL,
  trainer_id  VARCHAR(10) NULL,
  CONSTRAINT chk_member_phone CHECK (phone REGEXP '^[0-9]{10}$'),
  CONSTRAINT fk_member_trainer FOREIGN KEY (trainer_id)
      REFERENCES Trainers(trainer_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ---------- Membership_Plans ----------
CREATE TABLE Membership_Plans (
  plan_id       VARCHAR(10)  PRIMARY KEY,
  plan_name     VARCHAR(30)  NOT NULL UNIQUE,
  duration_days INT          NOT NULL CHECK (duration_days > 0),
  price         DECIMAL(8,2) NOT NULL CHECK (price > 0)
);

-- ---------- Memberships (resolves Members <-> Plans many-to-many) ----------
CREATE TABLE Memberships (
  membership_id VARCHAR(10) PRIMARY KEY,
  member_id     VARCHAR(10) NOT NULL,
  plan_id       VARCHAR(10) NOT NULL,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  CONSTRAINT chk_dates CHECK (end_date > start_date),
  CONSTRAINT fk_ms_member FOREIGN KEY (member_id)
      REFERENCES Members(member_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ms_plan FOREIGN KEY (plan_id)
      REFERENCES Membership_Plans(plan_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ---------- Attendance ----------
CREATE TABLE Attendance (
  attendance_id INT AUTO_INCREMENT PRIMARY KEY,
  member_id     VARCHAR(10) NOT NULL,
  check_in_date DATE NOT NULL,
  check_in_time TIME NOT NULL,
  CONSTRAINT uq_one_checkin_per_day UNIQUE (member_id, check_in_date),  -- prevents duplicate check-in
  CONSTRAINT fk_att_member FOREIGN KEY (member_id)
      REFERENCES Members(member_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ---------- Payments ----------
CREATE TABLE Payments (
  payment_id    VARCHAR(10) PRIMARY KEY,
  member_id     VARCHAR(10) NOT NULL,
  membership_id VARCHAR(10) NULL,
  amount        DECIMAL(8,2) NOT NULL CHECK (amount > 0),
  method        ENUM('Cash','UPI','Card') NOT NULL,
  txn_ref       VARCHAR(30) NOT NULL,
  payment_date  DATE NOT NULL,
  admin_id      VARCHAR(10) NULL,
  CONSTRAINT fk_pay_member FOREIGN KEY (member_id)
      REFERENCES Members(member_id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pay_membership FOREIGN KEY (membership_id)
      REFERENCES Memberships(membership_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_pay_admin FOREIGN KEY (admin_id)
      REFERENCES Admins(admin_id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- ---------- Indexes (speed up searches used by the website) ----------
CREATE INDEX idx_member_name   ON Members(name);
CREATE INDEX idx_pay_date      ON Payments(payment_date);
CREATE INDEX idx_ms_end_date   ON Memberships(end_date);

-- ---------- VIEW: current status of every member ----------
CREATE VIEW vw_member_status AS
SELECT m.member_id, m.name, m.phone,
       MAX(ms.end_date) AS last_expiry,
       CASE
         WHEN MAX(ms.end_date) IS NULL              THEN 'none'
         WHEN MAX(ms.end_date) <  CURDATE()          THEN 'expired'
         WHEN MAX(ms.end_date) <= CURDATE() + INTERVAL 7 DAY THEN 'expiring'
         ELSE 'active'
       END AS status
FROM Members m
LEFT JOIN Memberships ms ON ms.member_id = m.member_id
GROUP BY m.member_id, m.name, m.phone;

-- ---------- TRIGGER: expired members cannot check in ----------
DELIMITER //
CREATE TRIGGER trg_block_expired_checkin
BEFORE INSERT ON Attendance
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM Memberships
                 WHERE member_id = NEW.member_id
                   AND NEW.check_in_date BETWEEN start_date AND end_date) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Check-in blocked: member has no active membership';
  END IF;
END//
DELIMITER ;
