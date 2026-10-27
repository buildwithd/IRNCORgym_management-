-- =====================================================
-- 2_data.sql  |  Demo data (dates are relative to today)
-- =====================================================
USE gym_db;

INSERT INTO Admins VALUES ('A1','admin','admin123');

INSERT INTO Trainers VALUES
('T1','Ravi Shankar','9876500001','Strength Training'),
('T2','Anita Roy','9876500002','Cardio & Yoga');

INSERT INTO Membership_Plans VALUES
('P1','Monthly',30,1000.00),
('P2','Quarterly',90,2700.00),
('P3','Annual',365,9000.00);

INSERT INTO Members VALUES
('M101','Arun Kumar','9876543210','arun@mail.com','Male',  CURDATE() - INTERVAL 5 DAY,  'T1'),
('M102','Priya Sharma','9876543321','priya@mail.com','Female',CURDATE() - INTERVAL 25 DAY, 'T2'),
('M103','Karthik Raj','9876543432','karthik@mail.com','Male', CURDATE() - INTERVAL 40 DAY, 'T1'),
('M104','Divya Menon','9876543543','divya@mail.com','Female', CURDATE() - INTERVAL 70 DAY, 'T2'),
('M105','Rahul Verma','9876543654','rahul@mail.com','Male',  CURDATE() - INTERVAL 10 DAY, 'T1'),
('M106','Sneha Patel','9876543765','sneha@mail.com','Female', CURDATE() - INTERVAL 100 DAY,'T2'),
('M107','Vijay Anand','9876543876','vijay@mail.com','Male',  CURDATE() - INTERVAL 24 DAY, 'T1'),
('M108','Meena Krishnan','9876543987','meena@mail.com','Female',CURDATE() - INTERVAL 3 DAY, 'T2');

-- end_date = start_date + plan duration
INSERT INTO Memberships VALUES
('MS1','M101','P1', CURDATE() - INTERVAL 5 DAY,   CURDATE() - INTERVAL 5 DAY   + INTERVAL 30 DAY),
('MS2','M102','P2', CURDATE() - INTERVAL 25 DAY,  CURDATE() - INTERVAL 25 DAY  + INTERVAL 90 DAY),
('MS3','M103','P3', CURDATE() - INTERVAL 40 DAY,  CURDATE() - INTERVAL 40 DAY  + INTERVAL 365 DAY),
('MS4','M104','P1', CURDATE() - INTERVAL 70 DAY,  CURDATE() - INTERVAL 70 DAY  + INTERVAL 30 DAY),   -- expired
('MS5','M105','P2', CURDATE() - INTERVAL 10 DAY,  CURDATE() - INTERVAL 10 DAY  + INTERVAL 90 DAY),
('MS6','M106','P3', CURDATE() - INTERVAL 100 DAY, CURDATE() - INTERVAL 100 DAY + INTERVAL 365 DAY),
('MS7','M107','P1', CURDATE() - INTERVAL 24 DAY,  CURDATE() - INTERVAL 24 DAY  + INTERVAL 30 DAY),   -- expiring soon
('MS8','M108','P2', CURDATE() - INTERVAL 3 DAY,   CURDATE() - INTERVAL 3 DAY   + INTERVAL 90 DAY);

INSERT INTO Payments VALUES
('PAY1','M101','MS1',1000.00,'Cash','TXN9000', CURDATE() - INTERVAL 5 DAY,   'A1'),
('PAY2','M102','MS2',2700.00,'UPI', 'TXN9001', CURDATE() - INTERVAL 25 DAY,  'A1'),
('PAY3','M103','MS3',9000.00,'Card','TXN9002', CURDATE() - INTERVAL 40 DAY,  'A1'),
('PAY4','M104','MS4',1000.00,'Cash','TXN9003', CURDATE() - INTERVAL 70 DAY,  'A1'),
('PAY5','M105','MS5',2700.00,'UPI', 'TXN9004', CURDATE() - INTERVAL 10 DAY,  'A1'),
('PAY6','M106','MS6',9000.00,'Card','TXN9005', CURDATE() - INTERVAL 100 DAY, 'A1'),
('PAY7','M107','MS7',1000.00,'Cash','TXN9006', CURDATE() - INTERVAL 24 DAY,  'A1'),
('PAY8','M108','MS8',2700.00,'UPI', 'TXN9007', CURDATE() - INTERVAL 3 DAY,   'A1');

-- All check-ins fall inside each member's valid membership (the trigger checks this)
INSERT INTO Attendance (member_id, check_in_date, check_in_time) VALUES
('M101', CURDATE(),                 '06:30:00'), ('M101', CURDATE() - INTERVAL 1 DAY,'07:00:00'),
('M101', CURDATE() - INTERVAL 2 DAY,'06:45:00'), ('M101', CURDATE() - INTERVAL 4 DAY,'18:00:00'),
('M102', CURDATE(),                 '07:15:00'), ('M102', CURDATE() - INTERVAL 1 DAY,'07:20:00'),
('M102', CURDATE() - INTERVAL 3 DAY,'19:00:00'),
('M103', CURDATE() - INTERVAL 1 DAY,'08:00:00'), ('M103', CURDATE() - INTERVAL 2 DAY,'08:10:00'),
('M103', CURDATE() - INTERVAL 5 DAY,'17:30:00'),
('M104', CURDATE() - INTERVAL 65 DAY,'06:00:00'),('M104', CURDATE() - INTERVAL 60 DAY,'06:10:00'),
('M105', CURDATE(),                 '09:00:00'), ('M105', CURDATE() - INTERVAL 2 DAY,'09:05:00'),
('M106', CURDATE() - INTERVAL 1 DAY,'18:30:00'), ('M106', CURDATE() - INTERVAL 3 DAY,'18:45:00'),
('M107', CURDATE(),                 '06:50:00'), ('M107', CURDATE() - INTERVAL 1 DAY,'06:55:00'),
('M108', CURDATE(),                 '10:00:00');
