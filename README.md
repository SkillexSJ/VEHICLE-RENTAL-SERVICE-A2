# 🚗 Vehicle Rental Service API

A robust and scalable RESTful API for managing vehicle rentals, built with Node.js, Express, TypeScript, and PostgreSQL.

## 🌐 Live URL

[https://your-deployment-url.com](https://your-deployment-url.com) _(Update with actual deployment URL)_

---

## ✨ Features

- **Authentication:** JWT-based user registration & login with role-based access (Admin/Customer)
- **Vehicle Management:** Full CRUD operations with real-time availability tracking and auto-status updates
- **Booking System:** Automatic price calculation, role-based views, auto-return for expired bookings, double-booking prevention
- **User Management:** Admin manages all users, customers manage own profiles only
- **Data Validation:** Comprehensive input validation with database-level constraints

---

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5.2.1) + TypeScript (v5.9.3)
- **Database:** PostgreSQL with NEONDB
- **Authentication:** JWT (jsonwebtoken) + bcryptjs
- **Development:** tsx, dotenv

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/SkillexSJ/VEHICLE-RENTAL-SERVICE-A2.git
cd VEHICLE-RENTAL-SERVICE-A2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
CONNECTION_STRING=neon_database_connection_string
PORT=3000
JWT_SECRET=my_secret_key
```

### 4. Set Up Database

The application will automatically create the required tables on startup. The database schema includes:

- **users** - User accounts with role-based access
- **vehicles** - Vehicle inventory
- **bookings** - Rental bookings with status tracking

### 5. Run the Application

**Development Mode** (with hot reload):

```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## 📖 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

| Method | Endpoint       | Access | Description       |
| ------ | -------------- | ------ | ----------------- |
| POST   | `/auth/signup` | Public | Register new user |
| POST   | `/auth/login`  | Public | User login        |

### Vehicles

| Method | Endpoint               | Access | Description        |
| ------ | ---------------------- | ------ | ------------------ |
| GET    | `/vehicles`            | Public | Get all vehicles   |
| GET    | `/vehicles/:vehicleId` | Public | Get vehicle by ID  |
| POST   | `/vehicles`            | Admin  | Create new vehicle |
| PUT    | `/vehicles/:vehicleId` | Admin  | Update vehicle     |
| DELETE | `/vehicles/:vehicleId` | Admin  | Delete vehicle     |

### Bookings

| Method | Endpoint               | Access         | Description                   |
| ------ | ---------------------- | -------------- | ----------------------------- |
| POST   | `/bookings`            | Public         | Create booking                |
| GET    | `/bookings`            | Admin/Customer | Get all bookings (role-based) |
| PUT    | `/bookings/:bookingId` | Admin/Customer | Update booking status         |

### Users

| Method | Endpoint         | Access         | Description                             |
| ------ | ---------------- | -------------- | --------------------------------------- |
| GET    | `/users`         | Admin          | Get all users                           |
| PUT    | `/users/:userId` | Admin/Customer | Update user (admin: any, customer: own) |
| DELETE | `/users/:userId` | Admin          | Delete user                             |

---
