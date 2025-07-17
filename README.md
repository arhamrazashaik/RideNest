Deployed Link: https://ridenest.netlify.app/

# VAARMINDS Ride Sharing Platform

A full-stack ride-sharing application with separate backend and frontend projects. This platform allows users to book rides, join groups, and manage ride-sharing activities, with special features like She Mode for women.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Running the Application](#running-the-application)
- [MongoDB Setup](#mongodb-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features
- User registration and authentication
- Book and join rides
- Group ride management
- Driver and passenger dashboards
- She Mode (women-only rides)
- Payment integration (placeholder)

---

## Project Structure
```
VAARMINDS-main/
  README.md
  VAARMINDS-main/
    kr0354-ride-sharing-backend/   # Node.js/Express backend
    kr0354-ride-sharing-frontend/  # React frontend
```

---

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (running locally or accessible remotely)

---

## Setup Instructions

### Backend
1. Open a terminal and navigate to the backend directory:
   ```sh
   cd VAARMINDS-main/VAARMINDS-main/kr0354-ride-sharing-backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Ensure MongoDB is running (see [MongoDB Setup](#mongodb-setup)).
4. Start the backend server:
   ```sh
   npm start
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

### Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```sh
   cd VAARMINDS-main/VAARMINDS-main/kr0354-ride-sharing-frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

---

## MongoDB Setup
1. **Install MongoDB** if you haven't already: [Download MongoDB](https://www.mongodb.com/try/download/community)
2. **Start MongoDB**:
   - Open a terminal and run:
     ```sh
     & "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
     ```
   - Leave this window open while using the app.
3. The backend expects MongoDB to be running at `mongodb://localhost:27017` by default.

---

## Environment Variables
- Backend configuration (such as MongoDB URI, JWT secrets, etc.) can be set in environment variables or a `.env` file in the backend directory.
- Example `.env` (create if needed):
  ```env
  MONGODB_URI=mongodb://localhost:27017/vaarminds
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```

---

## Troubleshooting
- **MongoDB connection errors:**
  - Ensure MongoDB is running before starting the backend.
  - Check that the connection URI in your backend config matches your MongoDB instance.
- **Port conflicts:**
  - Make sure ports 5000 (backend) and 5173 (frontend) are free or update the configs.
- **Windows PowerShell issues:**
  - Use `&` before the path to run executables with spaces in the path.

---

## License
This project is for educational purposes. 