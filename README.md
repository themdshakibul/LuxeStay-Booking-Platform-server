# 🏨 LuxeStay — Backend Server (REST API)

<div align="center">

![LuxeStay Server](https://img.shields.io/badge/LuxeStay-Backend%20API-gold?style=for-the-badge&logo=server&logoColor=white)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-black?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

> **RESTful API server for the LuxeStay luxury hotel booking platform — built with Node.js, Express, and MongoDB.**

[🌐 Frontend Repo](https://github.com/themdshakibul/LuxeStay-Booking-Platform) · [🐛 Report a Bug](https://github.com/themdshakibul/LuxeStay-Booking-Platform/issues) · [✨ Request a Feature](https://github.com/themdshakibul/LuxeStay-Booking-Platform/issues)

</div>

---

## 📋 Table of Contents

- [🏨 LuxeStay — Backend Server (REST API)](#-luxestay--backend-server-rest-api)
  - [📋 Table of Contents](#-table-of-contents)
  - [🎯 About the Project](#-about-the-project)
  - [✨ Features](#-features)
  - [🛠 Tech Stack](#-tech-stack)
  - [📁 Folder Structure](#-folder-structure)
  - [🚀 Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [🔐 Environment Variables](#-environment-variables)
  - [📡 API Endpoints](#-api-endpoints)
    - [🔑 Auth](#-auth)
    - [🏨 Hotels](#-hotels)
    - [🛏️ Rooms](#️-rooms)
    - [📅 Bookings](#-bookings)
    - [👤 Users](#-users)
  - [🔒 Authentication](#-authentication)
  - [📦 Available Scripts](#-available-scripts)
  - [🌐 Deployment](#-deployment)
    - [Deploy to Render / Railway](#deploy-to-render--railway)
  - [🤝 Contributing](#-contributing)
  - [📄 License](#-license)

---

## 🎯 About the Project

This is the **backend REST API** for LuxeStay — a luxury hotel booking platform. It handles all server-side logic including user authentication, hotel and room management, booking operations, and payment processing. The API is consumed by the [LuxeStay Next.js frontend](https://github.com/themdshakibul/LuxeStay-Booking-Platform).

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login, registration, and token refresh
- 🏨 **Hotel Management** — Full CRUD for hotels, rooms, and availability
- 📅 **Booking System** — Create, update, cancel, and track reservations
- 💳 **Payment Integration** — Secure payment handling
- 👤 **User Roles** — Admin and guest role-based access control
- 🔍 **Advanced Filtering** — Filter rooms by date, price, type, and capacity
- 🛡️ **Input Validation** — Request validation with proper error messages
- 📊 **Admin Dashboard API** — Endpoints for managing the platform

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework & routing |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin resource sharing |
| **cookie-parser** | Cookie handling |

---

## 📁 Folder Structure

```
luxestay-server/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js            # JWT verification middleware
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Hotel.js           # Hotel schema
│   │   ├── Room.js            # Room schema
│   │   └── Booking.js         # Booking schema
│   ├── routes/
│   │   ├── auth.routes.js     # Auth routes
│   │   ├── hotel.routes.js    # Hotel routes
│   │   ├── room.routes.js     # Room routes
│   │   ├── booking.routes.js  # Booking routes
│   │   └── user.routes.js     # User routes
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── hotel.controller.js
│   │   ├── room.controller.js
│   │   ├── booking.controller.js
│   │   └── user.controller.js
│   └── utils/
│       └── helpers.js         # Utility functions
├── .env                       # Environment variables (not committed)
├── .env.example               # Example env file
├── .gitignore
├── index.js                   # App entry point
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB
- npm or yarn

### Installation

**1. Clone the repository:**

```bash
git clone https://github.com/themdshakibul/LuxeStay-Server.git
cd LuxeStay-Server
```

**2. Install dependencies:**

```bash
npm install
```

**3. Set up environment variables:**

```bash
cp .env.example .env
# Fill in your values in the .env file
```

**4. Start the development server:**

```bash
npm run dev
```

The server will start at [http://localhost:5000](http://localhost:5000)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/luxestay

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

---

## 📡 API Endpoints

### 🔑 Auth

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get token | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |

### 🏨 Hotels

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/hotels` | Get all hotels | Public |
| GET | `/api/hotels/:id` | Get single hotel | Public |
| POST | `/api/hotels` | Create a hotel | Admin |
| PUT | `/api/hotels/:id` | Update a hotel | Admin |
| DELETE | `/api/hotels/:id` | Delete a hotel | Admin |

### 🛏️ Rooms

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/rooms` | Get all rooms | Public |
| GET | `/api/rooms/:id` | Get single room | Public |
| GET | `/api/hotels/:id/rooms` | Get rooms by hotel | Public |
| POST | `/api/rooms` | Create a room | Admin |
| PUT | `/api/rooms/:id` | Update a room | Admin |
| DELETE | `/api/rooms/:id` | Delete a room | Admin |

### 📅 Bookings

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/bookings` | Get all bookings | Admin |
| GET | `/api/bookings/:id` | Get single booking | Private |
| GET | `/api/bookings/user/me` | Get current user bookings | Private |
| POST | `/api/bookings` | Create a booking | Private |
| PUT | `/api/bookings/:id` | Update booking status | Admin |
| DELETE | `/api/bookings/:id` | Cancel a booking | Private |

### 👤 Users

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin |
| PUT | `/api/users/:id` | Update user profile | Private |
| DELETE | `/api/users/:id` | Delete user | Admin |

---

## 🔒 Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

1. Register or login to receive a token
2. Include the token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your_token_here>
```

**User Roles:**
- `guest` — Can browse hotels, make bookings, manage own profile
- `admin` — Full access to all resources and management endpoints

---

## 📦 Available Scripts

```bash
npm run dev       # Start with nodemon (auto-reload)
npm start         # Start production server
npm run lint      # Run ESLint
```

---

## 🌐 Deployment

### Deploy to Render / Railway

1. Push your code to GitHub
2. Connect the repository on [Render](https://render.com) or [Railway](https://railway.app)
3. Add all environment variables from `.env`
4. Set the start command to `npm start`
5. Deploy!

> Make sure to whitelist your server IP in MongoDB Atlas Network Access settings.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**LuxeStay Server** — *Powering luxury stays behind the scenes*

Made with ❤️ by [themdshakibul](https://github.com/themdshakibul)

</div>