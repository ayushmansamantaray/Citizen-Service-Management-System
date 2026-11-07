# Citizen Service Management System (CSMS)

A college-project MERN application with Citizen, Officer and Admin roles.

## Stack
- React + Vite (frontend)
- Node.js + Express (REST API)
- MongoDB + Mongoose (database)
- JWT authentication + bcrypt password hashing
- Multer local document uploads

## Requirements
- Node.js 18+
- MongoDB Community Server running locally OR a MongoDB Atlas connection string
- VS Code (recommended)

## 1. Configure backend
Open a terminal:
```bash
cd server
copy .env.example .env
npm install
```
Edit `server/.env` and set `MONGO_URI`. For local MongoDB, the default is:
`mongodb://127.0.0.1:27017/csms`

## 2. Seed demo accounts and sample services
```bash
npm run seed
```
Demo accounts (password for all: `Password123!`):
- Admin: `admin@csms.local`
- Officer: `officer@csms.local`
- Citizen: `citizen@csms.local`

## 3. Start backend
```bash
npm run dev
```
Backend: http://localhost:5000
Health check: http://localhost:5000/api/health

## 4. Start frontend (new terminal)
```bash
cd client
npm install
copy .env.example .env
npm run dev
```
Frontend: http://localhost:5173

## Important
- Start MongoDB before the backend.
- Run `npm run seed` from the `server` directory after configuring `.env`.
- Uploaded files are stored in `server/uploads`. This is suitable for a local college demonstration, not production hosting.
- Use fictional/sample citizen data only. This project is an academic prototype and is not connected to any real government department.
- Change the JWT secret and demo passwords before any public deployment.

## Features
### Citizen
Register/login, browse services, submit applications, upload supporting documents, track status, submit complaints and read notifications.

### Officer
Review assigned applications, view submitted documents, update application status with remarks, and respond to complaints.

### Admin
View system statistics, manage services, create officer accounts, assign applications to officers, view applications and complaints.

## Project structure
```
client/   React frontend
server/   Express API, Mongoose models, auth, uploads, seed script
```
