-- =====================================================
-- 3_queries.sql  |  Queries behind each module of the website
-- =====================================================
USE gym_db;

-- ================= A. BASIC / SEARCH =================
-- A1. Search members by name, phone or ID
SELECT * FROM Members
WHERE name LIKE '%ar%' OR phone LIKE '%9876%' OR member_id = 'M101';

-- A2. Filter members by membership status (uses the VIEW)
SELECT * FROM vw_member_status WHERE status = 'expired';

-- ================= B. JOIN =================
-- B1. Members with trainer name (INNER/LEFT JOIN)
SELECT m.member_id, m.name AS member, COALESCE(t.name,'Unassigned') AS trainer
FROM Members m LEFT JOIN Trainers t ON m.trainer_id = t.trainer_id;

-- B2. Member + plan + expiry (3-table JOIN)
SELECT m.name, p.plan_name, ms.start_date, ms.end_date
FROM Members m
JOIN Memberships ms     ON m.member_id = ms.member_id
JOIN Membership_Plans p ON p.plan_id   = ms.plan_id
ORDER BY ms.end_date DESC;

-- B3. Payment history of one member
SELECT p.payment_id, p.payment_date, p.amount, p.method, p.txn_ref, pl.plan_name
FROM Payments p
JOIN Memberships ms     ON p.membership_id = ms.membership_id
JOIN Membership_Plans pl ON pl.plan_id = ms.plan_id
WHERE p.member_id = 'M101';

-- B4. Members assigned to each trainer
SELECT t.name AS trainer, m.name AS member
FROM Trainers t JOIN Members m ON m.trainer_id = t.trainer_id
ORDER BY t.name;

-- ================= C. GROUP BY + AGGREGATES =================
-- C1. Revenue of the current month (Dashboard card)
SELECT SUM(amount) AS revenue_this_month
FROM Payments
WHERE YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE());

-- C2. Monthly revenue report (Dashboard chart)
SELECT DATE_FORMAT(payment_date,'%Y-%m') AS month, SUM(amount) AS revenue, COUNT(*) AS payments
FROM Payments GROUP BY DATE_FORMAT(payment_date,'%Y-%m') ORDER BY month;

-- C3. Revenue by payment method
SELECT method, COUNT(*) AS no_of_payments, SUM(amount) AS total, AVG(amount) AS average
FROM Payments GROUP BY method;

-- C4. Most popular membership plans
SELECT p.plan_name, COUNT(*) AS times_bought
FROM Memberships ms JOIN Membership_Plans p ON p.plan_id = ms.plan_id
GROUP BY p.plan_name ORDER BY times_bought DESC;

-- C5. Top 5 members by attendance
SELECT m.name, COUNT(a.attendance_id) AS visits
FROM Members m JOIN Attendance a ON a.member_id = m.member_id
GROUP BY m.member_id, m.name ORDER BY visits DESC LIMIT 5;

-- C6. Daily attendance count (HAVING: days with 3+ visits)
SELECT check_in_date, COUNT(*) AS visitors
FROM Attendance GROUP BY check_in_date HAVING COUNT(*) >= 3 ORDER BY check_in_date DESC;

-- C7. Members count per status
SELECT status, COUNT(*) AS total FROM vw_member_status GROUP BY status;

-- ================= D. SUBQUERIES =================
-- D1. Members who never attended
SELECT name FROM Members WHERE member_id NOT IN (SELECT member_id FROM Attendance);

-- D2. Members who paid more than the average payment
SELECT m.name, SUM(p.amount) AS total_paid
FROM Members m JOIN Payments p ON p.member_id = m.member_id
GROUP BY m.member_id, m.name
HAVING SUM(p.amount) > (SELECT AVG(amount) FROM Payments);

-- D3. Plan with the highest price
SELECT * FROM Membership_Plans WHERE price = (SELECT MAX(price) FROM Membership_Plans);

-- D4. Members whose latest membership is expiring in the next 7 days (notifications)
SELECT m.name, m.phone, x.last_expiry
FROM Members m
JOIN (SELECT member_id, MAX(end_date) AS last_expiry FROM Memberships GROUP BY member_id) x
  ON x.member_id = m.member_id
WHERE x.last_expiry BETWEEN CURDATE() AND CURDATE() + INTERVAL 7 DAY;

-- D5. Members who attended today (EXISTS)
SELECT name FROM Members m
WHERE EXISTS (SELECT 1 FROM Attendance a WHERE a.member_id = m.member_id AND a.check_in_date = CURDATE());

-- ================= E. DML (what the Add / Edit / Delete buttons do) =================
-- E1. Add member
INSERT INTO Members VALUES ('M109','Naveen Raj','9000000001','naveen@mail.com','Male',CURDATE(),'T1');

-- E2. Edit member
UPDATE Members SET phone = '9000000002', trainer_id = 'T2' WHERE member_id = 'M109';

-- E3. Renew membership with payment (TRANSACTION = both succeed or none)
START TRANSACTION;
INSERT INTO Memberships VALUES ('MS9','M109','P1', CURDATE(), CURDATE() + INTERVAL 30 DAY);
INSERT INTO Payments VALUES ('PAY9','M109','MS9',1000.00,'UPI','TXN9100',CURDATE(),'A1');
COMMIT;

-- E4. Delete member (ON DELETE CASCADE removes his memberships, payments, attendance)
DELETE FROM Members WHERE member_id = 'M109';

-- ================= F. CONSTRAINT / TRIGGER DEMOS (each should show an ERROR) =================
-- F1. Duplicate check-in on same day -> violates UNIQUE (member_id, check_in_date)
-- INSERT INTO Attendance (member_id, check_in_date, check_in_time) VALUES ('M101', CURDATE(), '10:00:00');

-- F2. Expired member check-in -> blocked by trigger trg_block_expired_checkin
-- INSERT INTO Attendance (member_id, check_in_date, check_in_time) VALUES ('M104', CURDATE(), '10:00:00');

-- F3. Duplicate phone -> violates UNIQUE
-- INSERT INTO Members VALUES ('M110','Test','9876543210',NULL,'Male',CURDATE(),NULL);

-- F4. Invalid phone -> violates CHECK
-- INSERT INTO Members VALUES ('M111','Test','12345',NULL,'Male',CURDATE(),NULL);

-- F5. Delete a plan that is in use -> blocked by ON DELETE RESTRICT
-- DELETE FROM Membership_Plans WHERE plan_id = 'P1';
