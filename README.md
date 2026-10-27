#**IRNCORgym_management**

A Database Management project using **MySQL 8**, with a front-end prototype in **HTML, CSS and JavaScript**.

It manages gym members, membership plans, memberships, attendance, payments and trainers, replacing paper registers and spreadsheets that cause duplicate entries, missed renewals, wrong revenue totals and attendance by expired members.

> **Note:** The MySQL scripts are the actual database. The website is a prototype that stores data in browser `localStorage` and is **not** connected to MySQL.

---

## 📁 Repository Structure

| File | Purpose |
|---|---|
| `1_schema.sql` | Database, 7 tables, indexes, view and trigger |
| `2_data.sql` | Sample data (dates are relative to `CURDATE()`) |
| `3_queries.sql` | Queries behind each module, DML, and constraint/trigger demos |
| `index.html` | Front-end prototype page |
| `style.css` | Black / red / white theme |
| `app.js` | Prototype logic with `localStorage` persistence |

---

## 🗄️ Database Design (`gym_db`)

**7 tables:** `Admins`, `Trainers`, `Members`, `Membership_Plans`, `Memberships`, `Attendance`, `Payments`

| Relationship | Type | ON DELETE |
|---|---|---|
| Trainers → Members | 1:N | SET NULL |
| Members → Memberships | 1:N | CASCADE |
| Membership_Plans → Memberships | 1:N | RESTRICT |
| Members → Attendance | 1:N | CASCADE |
| Members → Payments | 1:N | CASCADE |
| Memberships → Payments | 1:N | SET NULL |
| Admins → Payments | 1:N | SET NULL |

Members and Membership_Plans are many-to-many, resolved by `Memberships`. The design is in **3NF**.

### Database features
- **Constraints:** primary keys, foreign keys, `UNIQUE`, `CHECK`, `NOT NULL`, `ENUM`
- **Indexes:** `Members(name)`, `Payments(payment_date)`, `Memberships(end_date)`
- **View:** `vw_member_status` classifies members as `active`, `expiring` (within 7 days), `expired` or `none`
- **Trigger:** `trg_block_expired_checkin` (BEFORE INSERT on `Attendance`) blocks check-ins without a valid membership
- **Transaction:** renewing a membership and recording its payment succeed or fail together

No stored procedures or functions are used.

### Business rules
1. Membership expiry = start date + plan duration
2. "Expiring soon" = expiry within 7 days
3. One check-in per member per day
4. Expired members cannot check in
5. Payment amount must be positive

### Sample data
8 members, 2 trainers, 1 admin, 3 plans (Monthly 30 days ₹1000, Quarterly 90 days ₹2700, Annual 365 days ₹9000). Divya Menon is expired, Vijay Anand is expiring soon, and the rest are active.

---

## 🚀 How to Run

### MySQL database
Requires MySQL 8.0.16 or higher (CHECK constraints are enforced from this version).

```bash
mysql -u root -p < 1_schema.sql
mysql -u root -p < 2_data.sql
mysql -u root -p < 3_queries.sql
```

Or open the three files in **MySQL Workbench** and run them in this order: `1_schema.sql` → `2_data.sql` → `3_queries.sql`.

The constraint and trigger demos in section F of `3_queries.sql` are commented out. Remove the `--` to see each error.

### Front-end prototype
No installation needed. Open `index.html` in any modern browser.

---

## 🖥️ Website Modules

- **Dashboard:** member, membership, attendance and revenue cards, charts, recent members and payments
- **Members:** add, view, edit, delete (with confirmation), search, status filter, history
- **Memberships:** monthly, quarterly and annual plans, assign and renew, status tracking
- **Attendance:** check-in with date and time, duplicate and expired check-ins blocked
- **Payments:** Cash, UPI or Card, transaction reference, printable receipt, monthly revenue
- **Trainers:** add, edit, delete, assign to members
- **Reports:** monthly revenue, attendance by date range, active vs expired, top attendance, popular plans (printable)
- **Global search and expiry notifications**
- **Settings:** `localStorage` persistence, restore demo data, reset with confirmation
- **Database Design page:** ER diagram, tables, keys, relationships and sample SQL

---

## 🔍 SQL Concepts Demonstrated

`JOIN` · `LEFT JOIN` · `GROUP BY` · `HAVING` · `SUM / COUNT / AVG` · subqueries (`NOT IN`, `EXISTS`, scalar) · `BETWEEN` · `CASE` · views · triggers · transactions · constraints · indexes

---

## ⚠️ Limitations

- The website uses `localStorage`, so its data is per-browser and not stored in MySQL
- No real login and no password hashing (the sample admin password is plain text)
- No online payment gateway
- Single-branch gym

## 🔮 Future Enhancements

- Connect the front end to MySQL through a backend (Node.js / PHP / Python)
- Password hashing and role-based access
- SMS / email renewal reminders
- QR / biometric check-in
- Stored procedures
- Mobile app

---

## 👩‍💻 Author

**Sudrita Deb Ena** (Reg No: 711525BCS168)
B.E. Computer Science and Engineering, KIT – Kalaignarkarunanidhi Institute of Technology, Coimbatore
Affiliated to Anna University, Chennai

*Submitted as a DBMS project, October 2026.*
