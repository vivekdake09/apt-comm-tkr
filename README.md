# Apt-Comm — Apartment Community Platform

Apt-Comm is a comprehensive, production-ready full-stack digital management system built to centralize apartment community operations. It replaces chaotic and unindexed WhatsApp-based management groups with a unified workspace serving residents, administrators, and gatehouse security personnel.

---

## 1. Tech Stack & Architecture Justification

### Frontend: React.js (Vite) & Vanilla CSS
- **React.js:** Offers components modularity and declarative state management, supporting highly interactive dashboards.
- **Vite:** Handpicked as the bundle compiler because of its instant hot module reloading and highly optimized production builds.
- **Vanilla CSS:** Custom-tailored variables and modular layout properties are utilized to maintain clean visual control and fluid glassmorphic dashboards without tailwind dependency overhead.
- **Lucide Icons:** Provides lightweight vector iconography.

### Backend: Java Spring Boot 3.3.x (Java 17)
- **Spring Boot:** Selected for its enterprise-standard robustness, dependency injection, and security integrations.
- **Spring Security (JWT):** Implements stateless Role-Based Access Control (RBAC).
- **Spring Data JPA (Hibernate):** Simplifies mapping models to relation records, enforcing data integrity.

### Database: MySQL 8.x
- Chosen for its ACID compliance, support for relational tables, indexing configurations, and query speeds.

### API Architecture: RESTful Web Services
- Adheres to clean URI paths, appropriate HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), and standard HTTP status codes.

---

## 2. Feature Matrix by User Role

### Resident Portal
- **Complaint Desk:** Submit maintenance requests (Plumbing, Electrical, etc.) with detailed descriptions. Track work updates in real-time.
- **Visitor Pre-Approvals:** Schedule planned visitor entries. Generates a secure, shareable QR pass code for instant guard verification.
- **Parcel Lockers:** Track incoming courier packages logged by security guards.
- **Rent & Maintenance Payments:** View unpaid bills. Execute instant payments via a mock checkout checkout gateway.
- **Amenity Space Bookings:** Book facilities (Clubhouse, Gym, Tennis Court, Party Hall) with auto conflict-checking checks.
- **Community Surveys:** Vote in active polls and see real-time vote distribution graphs.

### Gatehouse Security Terminal
- **QR scan Verification:** Manually scan/enter resident pre-approval QR tokens to check guests in and log vehicle gate logs.
- **Walk-in registry:** Log surprise visitors and couriers.
- **Vehicle Gate Log:** Record plate numbers and entry timestamps. Mark exit times on active records.
- **Parcel Log Desk:** Scan and log incoming packages to trigger resident alerts.

### Administration Console
- **Ops Dashboard:** Monitor metrics (active complaints, unpaid dues, gate entries).
- **AI Recurring Complaint Predictor:** Access an analytics-driven module mapping historical complaints to locations and categories to suggest preventive maintenance actions.
- **Finance Control:** Manage rent bills and clubhouse revenues.
- **Staff Directory:** Manage community staff (maintenance, cleaners) and update availability.
- **Community Surveys:** Publish polls with custom options and check metrics.

---

## 3. Database Schema Overview

The database contains 11 relational tables optimized with primary keys, foreign constraints, and indexing.

- **`users`:** Holds accounts with hashed credentials and flat mappings.
- **`complaints`:** Maps submitted support requests to categories and status flags.
- **`visitors`:** Stores visitor information, guest codes, and check-in/out timestamps.
- **`parcels`:** Logs incoming packages and pick-up flags.
- **`payments`:** Logs invoices, amounts, dues, and transaction reference IDs.
- **`bookings`:** Records amenity reservations with dates and time ranges.
- **`polls`**, **`poll_options`**, **`poll_votes`:** Manages community surveys.
- **`vehicle_logs`:** Logs vehicle plates and gate timestamps.
- **`staff`:** Records maintenance staff directories.

---

## 4. REST API Documentation

### Auth & Profile
- `POST /api/auth/register` - Register a user (enforces role check and BCrypt password encryption).
- `POST /api/auth/login` - Authenticate user and return a JWT access token.
- `GET /api/auth/profile` - Fetch current user context from the token.
- `GET /api/auth/residents` - Fetch list of residents (accessible to Security & Admin).

### Complaints
- `GET /api/complaints` - Fetch complaints. Residents get their own; Admins get all.
- `POST /api/complaints` - Resident files an issue.
- `PUT /api/complaints/{id}/status` - Admin updates status (`PENDING`, `IN_PROGRESS`, `RESOLVED`).
- `GET /api/complaints/predictions` - Analytics prediction mapping historical complaints density.

### Visitors & Gates
- `POST /api/visitors/pre-approve` - Resident schedules a visitor and gets a QR token.
- `GET /api/visitors/{id}/qr-pass` - Generate Base64 QR code image representing the pass.
- `GET /api/visitors/qr/{token}` - Validate visitor token details (Security/Admin access).
- `POST /api/visitors/qr/{token}/check-in` - Mark guest checked in (logs entry to vehicle logs if applicable).
- `POST /api/visitors/qr/{token}/check-out` - Mark guest checked out (updates vehicle log).
- `POST /api/visitors/walk-in` - Guard logs guest entry directly.

### Payments
- `GET /api/payments` - Retrieve billing invoices.
- `POST /api/payments/{id}/pay` - Submit transaction ID for payment.
- `POST /api/payments/webhook` - Asynchronous webhook handling payment status updates.

### Amenity Bookings
- `GET /api/bookings` - Retrieve reservations.
- `POST /api/bookings` - Create a reservation slot (validates overlaps).
- `DELETE /api/bookings/{id}` - Cancel reservation.

### Polls & Staff
- `GET /api/polls` - List polls with voting status and options metrics.
- `POST /api/polls` - Admin creates new poll.
- `POST /api/polls/{id}/vote` - Resident casts option ballot.
- `GET /api/staff` - Retrieve roster directory.
- `POST /api/staff` - Admin adds staff.
- `PUT /api/staff/{id}` - Admin updates staff details.

---

## 5. Setup & Running Locally

### Prerequisites
- **Java JDK 17** or higher
- **Node.js** v18+ & **npm**
- **MySQL Server 8.x**

### Database Setup
1. Log into your MySQL console:
   ```bash
   mysql -u root -p
   ```
2. Run the DDL setup script:
   ```sql
   source backend/src/main/resources/schema.sql;
   ```
   *Note: This creates `apt_comm_db` and seeds sample users (`admin`, `john_res`, `guard_bob` with password `password`).*

### Configuration Setup
1. **Backend Properties:** Open `backend/src/main/resources/application.properties` and replace:
   - `spring.datasource.username` with your database user name.
   - `spring.datasource.password` with your database password.
   - `aptcomm.jwt.secret` with a secure 256-bit secret key.
2. **Frontend Config:** Create a `.env` in `frontend/` if you want to override the default backend URL `http://localhost:8080`.

### Run Backend
```bash
cd backend
mvn clean spring-boot:run
```
*Server launches at `http://localhost:8080`.*

### Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*Vite web server launches at `http://localhost:5173`.*

---

## 6. Implementation Notes & Generation Log

For immediate transparency, the following features have comments indicating their deployment state:

- **ML Complaint Prediction (`ComplaintAnalyticsService.java`):** *Generated with statistical analytics engine*. Processes spatial-temporal category density metrics to compute recurrence probability without Python dependencies.
- **Payment Gateway Checkout (`PaymentService.java`):** *Generated with mock payment gateway*. Simulates card collections and processes callbacks. Type `FAIL_TXN` in the transaction reference input during checkout to test error responses.
- **QR Code Generation (`QrCodeService.java`):** *Generated using ZXing compiler*. Renders dynamic base64-encoded QR PNG assets for resident pre-approvals immediately ready for gate scanning.
- **Mail Alerts & Notifications:** Mock logged to outputs. Production integration requires adding SMTP/SMS credentials.

---

## 7. Deployment Instructions

### Production Package Build
1. **Backend Jar:**
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
   *Generates target/platform-0.0.1-SNAPSHOT.jar.*
2. **Frontend Assets:**
   ```bash
   cd frontend
   npm run build
   ```
   *Compiles source code into optimized assets under dist/.*

### Running via Docker Compose
Create a `docker-compose.yml` in the root:
```yaml
version: '3.8'
services:
  db:
    image: mysql:8
    restart: always
    environment:
      MYSQL_DATABASE: apt_comm_db
      MYSQL_ROOT_PASSWORD: password
    ports:
      - "3306:3306"
  backend:
    build: ./backend
    restart: always
    ports:
      - "8080:8080"
    depends_on:
      - db
```

---

## 8. Scaling Considerations
- **Caching:** Introduce Redis to cache active visitor passes and amenity calendar availability to lower SQL database strain.
- **Database Partitioning:** Partition the `vehicle_logs` and `complaints` tables chronologically as historical datasets grow.
- **Server Deployment:** Deploy behind an Nginx Reverse Proxy with SSL termination.
