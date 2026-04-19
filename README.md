# 🏥 DocBook

A full-stack doctor appointment booking system with role-based access, real-time notifications, and prescription management.

---

## ✨ Features

- **Role-Based Access** — three roles: User (patient), Doctor, and Admin with dedicated dashboards
- **Appointment Booking** — users can browse doctors, view available slots, and book appointments
- **Appointment Management** — reschedule, cancel, and track appointment status
- **Real-Time Notifications** — instant alerts for appointment confirmations, cancellations, and updates
- **Prescription Management** — doctors can add prescriptions with medicines for completed appointments
- **Doctor Approval System** — admin can approve/reject doctor applications
- **User Management** — admin can activate/deactivate users
- **Status Filters** — filter appointments by status (confirmed, completed, cancelled, pending)
- **Doctor Profiles** — view detailed doctor information including specialization and consultation fee
- **Commission Tracking** — admin can track platform commission from appointments
- **Material Design 3 UI** — modern, clean interface with smooth animations
- **Theme System** — 6 pre-built WCAG AA compliant themes (Default Blue, Medical Teal, Professional Purple, Nature Green, Warm Orange, Modern Gray)
- **Theme Customization** — users can select their preferred theme, admin can set default theme
- **Branding System** — admin can customize app name, logo, and contact email
- **Commission Settings** — admin can configure platform commission percentage
- **Doctor Profile Management** — doctors can update specialization, qualification, experience, fees (virtual/in-person), bio, address
- **Slot Management** — doctors can add/remove available time slots with date and time ranges (8 AM - 8 PM)
- **Max Appointments Limit** — doctors can set maximum appointments per day (1-50)
- **Doctor Ratings** — patient ratings displayed on doctor profiles
- **Search & Filter** — search doctors by name, specialization, or qualification; filter by specialty
- **Auto-Rescheduling** — affected appointments auto-rescheduled when doctor removes a slot
- **Toast Notifications** — success/error messages using react-toastify
- **Portal-Based Modals** — React Portal modals for prescriptions, rescheduling, and doctor profiles

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Lucide Icons, React Router, Zustand, React Toastify |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Caching & Events | Redis (Pub/Sub for events, Caching for performance) |
| Authentication | JWT (JSON Web Tokens) |
| File Upload | Multer |
| Validation | Custom validation middleware |
| Rate Limiting | Express Rate Limit |
| Security | Helmet, XSS Protection, CORS |
| State Management | Zustand (authStore, brandingStore) |

---

## 🚀 Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or MongoDB Atlas)
- Redis (local or Redis Cloud)
- npm or yarn

### Installing Redis

#### Option 1: Install Redis Locally

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or download from https://github.com/microsoftarchive/redis/releases
```

**macOS:**
```bash
# Using Homebrew
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### Option 2: Use Redis Cloud (Recommended for Production)
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a free account
3. Create a new database
4. Copy the connection URL

### Backend
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/docbook
JWT_SECRET=your_jwt_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Redis Configuration
# Option 1: Use individual host/port (for local Redis)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Option 2: Use Redis URL (for Redis Cloud or remote Redis)
# REDIS_URL=redis://localhost:6379
# REDIS_URL=redis://:password@host:port
```

Run the server:
```bash
npm run dev
```

Backend API will run on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

Run the frontend:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register-doctor` | Register as doctor |

### User Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/appointments` | Get user's appointments |
| POST | `/api/users/appointments` | Book new appointment |
| PUT | `/api/users/appointments/:id/reschedule` | Reschedule appointment |
| DELETE | `/api/users/appointments/:id` | Cancel appointment |
| GET | `/api/users/doctors` | Get all doctors |
| GET | `/api/users/doctors/:id/slots` | Get doctor's available slots |
| GET | `/api/users/notifications` | Get user notifications |
| PUT | `/api/users/notifications/:id/read` | Mark notification as read |
| PUT | `/api/users/notifications/read-all` | Mark all notifications as read |
| GET | `/api/users/prescriptions` | Get user's prescriptions |

### Public Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/branding` | Get public branding settings (app name, logo, contact email) |

### Doctor Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor/appointments` | Get doctor's appointments |
| PUT | `/api/doctor/appointments/:id/confirm` | Confirm appointment |
| PUT | `/api/doctor/appointments/:id/complete` | Mark appointment as completed |
| POST | `/api/doctor/prescription` | Add prescription |
| GET | `/api/doctor/slots` | Get doctor's slots |
| POST | `/api/doctor/slots` | Add new slot |
| DELETE | `/api/doctor/slots/:id` | Remove slot |
| PUT | `/api/doctor/profile` | Update doctor profile |

### Admin Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/doctors/pending` | Get pending doctor applications |
| GET | `/api/admin/doctors/all` | Get all doctors |
| PUT | `/api/admin/doctors/:id/approve` | Approve/reject doctor |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/toggle` | Activate/deactivate user |
| GET | `/api/admin/appointments` | Get all appointments |
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/settings` | Get app settings |
| PUT | `/api/admin/settings` | Update app settings |

---

## 🗄 Database Schema

### User Model
| Field | Type | Description |
|---|---|---|
| name | String | User name |
| email | String | Email (unique) |
| password | String | Hashed password |
| phone | String | Phone number |
| role | String | `user`, `doctor`, or `admin` |
| isActive | Boolean | Account status |
| profilePic | String | Profile picture URL |

### Doctor Model
| Field | Type | Description |
|---|---|---|
| user | ObjectId | Reference to User |
| specialization | String | Doctor's specialization |
| fee | Number | Consultation fee |
| virtualFee | Number | Virtual consultation fee |
| inPersonFee | Number | In-person consultation fee |
| maxAppointmentsPerDay | Number | Maximum appointments per day (default: 10) |
| experience | Number | Years of experience |
| qualification | String | Medical qualification |
| isApproved | String | `pending`, `approved`, or `rejected` |
| availableSlots | Array | Array of time slots |

### Appointment Model
| Field | Type | Description |
|---|---|---|
| user | ObjectId | Reference to User |
| doctor | ObjectId | Reference to Doctor |
| slot | Object | Date and time slot |
| status | String | `pending`, `confirmed`, `completed`, `cancelled`, `rescheduled` |
| doctorFee | Number | Doctor's fee |
| commission | Number | Platform commission |
| totalFee | Number | Total amount |
| prescription | ObjectId | Reference to Prescription |

### Prescription Model
| Field | Type | Description |
|---|---|---|
| appointment | ObjectId | Reference to Appointment |
| notes | String | Doctor's notes |
| medicines | Array | Array of medicines |

### Notification Model
| Field | Type | Description |
|---|---|---|
| user | ObjectId | Reference to User |
| title | String | Notification title |
| message | String | Notification message |
| type | String | Notification type |
| relatedAppointment | ObjectId | Reference to Appointment |
| isRead | Boolean | Read status |

### Settings Model
| Field | Type | Description |
|---|---|---|
| appName | String | Application name |
| appLogo | String | App logo URL |
| commissionRate | Number | Commission percentage |

---

## 📁 Project Structure
```
doctor-appointment-system/
├── backend/
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   ├── appointment.controller.js
│   │   ├── auth.controller.js
│   │   ├── doctor.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── Appointment.model.js
│   │   ├── Doctor.model.js
│   │   ├── Notification.model.js
│   │   ├── Prescription.model.js
│   │   ├── Settings.model.js
│   │   └── User.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── appointment.routes.js
│   │   ├── auth.routes.js
│   │   ├── doctor.routes.js
│   │   └── user.routes.js
│   ├── utils/
│   │   ├── cache.js
│   │   ├── emailService.js
│   │   ├── eventBus.js
│   │   ├── feeCalculator.js
│   │   └── notificationScheduler.js
│   ├── services/
│   │   └── notificationService.js
│   ├── config/
│   │   └── redis.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── Appointments.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Doctors.jsx
│   │   │   │   ├── Settings.jsx
│   │   │   │   └── Users.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── Appointments.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Profile.jsx
│   │   │   │   └── Slots.jsx
│   │   │   ├── user/
│   │   │   │   ├── Appointments.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Doctors.jsx
│   │   │   │   └── Prescriptions.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DoctorRegister.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── store/
│   │   │   └── authStore.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🎨 UI Features

- **Material Design 3** — Modern Material Design 3 color system and components
- **Responsive Design** — Works seamlessly on mobile, tablet, and desktop
- **Smooth Animations** — Fade-in, scale animations for cards and modals
- **Toast Notifications** — Success and error messages
- **Loading Spinners** — Visual feedback during data fetching
- **Modal System** — Portal-based modals for prescriptions, rescheduling, and doctor profiles
- **Status Badges** — Color-coded status indicators for appointments
- **Filter System** — Client-side filtering for fast response times

---

## 🔐 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- XSS protection
- Helmet security headers
- CORS configuration
- Input validation
- Account lockout after failed login attempts

---

## ⚡ Performance Features

- **Redis Caching** - Doctor profiles, slots, and dashboard stats cached for faster response times
- **Event-Driven Architecture** - Async notifications using Redis Pub/Sub
- **Database Indexing** - Optimized queries for frequently accessed data
- **Rate Limiting** - Prevents API abuse and DDoS attacks

---

## 📝 Notes

- The admin account needs to be created manually in the database with role "admin"
- Doctors must be approved by admin before they can accept appointments
- Commission is calculated based on the commission rate in settings
- Auto-rescheduling is available when a doctor's slot is removed
- Email notifications can be configured via the email service
- Redis is required for the event-driven notification system and caching
- If Redis is not available, the system will log errors but continue to function (with degraded performance)

---
