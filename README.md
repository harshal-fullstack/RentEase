# 📦 RentEase - Premium Full-Stack Rental Platform

RentEase is a full-stack web application designed for renting furniture and home appliances. Built with a modern tech stack, RentEase provides flexible, tenure-based pricing subscriptions, an intuitive shopping cart, secure checkout, a dedicated customer portal, and a powerful administrator dashboard.

---

## 🌟 Core Features

### 👤 Customer Experience
- **Interactive Product Catalog:** Browse furniture and appliances with real-time text search and category filters.
- **Flexible Tenure Pricing Matrix:** Choose different rental durations (1, 3, 6, or 12 months) on individual product details; pricing scales dynamically.
- **Advanced Shopping Cart:** Adjust quantities and modify tenures of items directly inside the cart. Refundable security deposits and monthly rent are calculated instantly.
- **Simulated Checkout & Payments:** Place rental bookings using mock credit/debit cards, UPI, or Net Banking options.
- **My Rentals Dashboard:** Track active, scheduled, and completed rental agreements along with due dates.

### 🛡️ Administrative Controls
- **Metrics Dashboard:** View real-time analytics including total orders, active subscriptions, cumulative revenue, and stock count.
- **Product Inventory Management (CRUD):** Add, update, and manage products, upload image URLs, configure tenure-based pricing structures, and control inventory.
- **Order Processing:** Oversee customer rental requests and process pending orders.

### 🔑 Authentication & Security
- **JWT Authorization:** Secured endpoints with token verification.
- **Role-Based Routing:** Protected page guards for customer routes (`/checkout`, `/my-rentals`) and administrator panels (`/admin`).
- **Autofill Quick-Login:** Quick-credentials buttons on the Login page for convenient testing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS 3, React Router 7, Lucide Icons, Fetch API |
| **Backend** | Node.js, Express 5, Mongoose 9, JWT (JsonWebToken), BcryptJS, CORS, Dotenv |
| **Database** | MongoMemoryServer (Embedded for zero-config runs) or MongoDB Atlas |

---

## 📂 Project Structure

```
RentEase/
├── backend/
│   ├── config/          # DB connections and environment configs
│   ├── middleware/      # Auth guards and validation layers
│   ├── models/          # Mongoose schemas (User, Product, Order, Rental)
│   ├── routes/          # API endpoint router files
│   ├── server.js        # Entry server point with automatic seeding logic
│   └── test.js          # API integration tests
│
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Layout components (Navbar, etc.)
│   │   ├── context/     # React state managers (AuthContext, CartContext)
│   │   ├── pages/       # Route pages (Home, Catalog, AdminDashboard, etc.)
│   │   ├── App.jsx      # Navigation routing & global providers
│   │   └── main.jsx     # Root rendering entry
```

---

## 🚀 Setup & Execution Guide

### Prerequisite
Ensure you have **Node.js (v18 or higher)** installed on your machine.

---

### Step 1: Run the Backend Server

1. Open your terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables (Optional):
   By default, the server spins up an **in-memory database** (`mongodb-memory-server`) with local persistence in the `backend/.mongodb_data` directory. If you want to connect to your own MongoDB database instead, create a `.env` file in the `backend` folder and add:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   MONGODB_URI=mongodb://localhost:27017/rentease
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:5000`.*

---

### Step 2: Run the Frontend App

1. Open a new terminal window/tab and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *The application will boot on `http://localhost:5173`.*

---

## 🧪 Testing

To run backend integration tests:
1. In the `backend` directory, run:
   ```bash
   npm test
   ```
   *This programmatically checks user register/login flows, product seedings, and order dispatch sequences.*

---

## 🔑 Demo Access Credentials

The database seeds default test accounts automatically on launch:

### 👤 Test Customer Account
- **Email:** `user@rentease.com`
- **Password:** `user123`

### 🛡️ Test Admin Account
- **Email:** `admin@rentease.com`
- **Password:** `admin123`

---

## 🔌 API Documentation Summary

### 🔐 Authentication (`/api/auth`)
- `POST /register` - Create new customer/admin user account.
- `POST /login` - Log in and obtain JWT token.
- `GET /me` - Retrieve profile info of currently logged-in user.

### 📦 Products (`/api/products`)
- `GET /` - Fetch all catalog products (with search query parsing).
- `GET /:id` - Retrieve details of a single product.

### 🛒 Orders & Checkout (`/api/orders`)
- `POST /` - Place a new order (adds rentals to active subscriptions).

### 📅 Rentals (`/api/rentals`)
- `GET /` - Fetch list of active rentals for the current customer.

### 🛡️ Admin Actions (`/api/admin`)
- `GET /stats` - Retrieve administrative metrics.
- `POST /products` - Insert a new product into the database.
- `PUT /products/:id` - Edit product specifications and pricing.
- `DELETE /products/:id` - Delete a product from inventory.
- `GET /orders` - Fetch all orders submitted on the platform.
