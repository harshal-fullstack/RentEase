# RentEase Setup and Execution Guide

Follow these step-by-step instructions to get the RentEase project up and running locally.

---

## 1. Database Setup

RentEase is configured to run out-of-the-box without requiring a pre-installed MongoDB instance.
- **In-Memory Database (Default):** If no `MONGODB_URI` environment variable is defined in the `backend/.env` file, the backend automatically spins up an in-memory MongoDB server (`mongodb-memory-server`) on start.
- **External MongoDB (Optional):** If you wish to use a local or cloud-based MongoDB database, add your connection string to the `backend/.env` file:
  ```env
  MONGODB_URI=mongodb://localhost:27017/rentease
  ```

---

## 2. Running the Backend Server

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the backend in development mode (with hot-reloading):
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

### Running Backend Tests
To run the API integration tests, you can execute the following command in the `backend` directory:
```bash
npm test
```
*(Note: The test runner will automatically boot the server programmatically if it is not already running on port 5000, execute the tests, and shut it down cleanly.)*

---

## 3. Running the Frontend App

1. Open a new terminal window or tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173` (or the port specified in the terminal output).*
