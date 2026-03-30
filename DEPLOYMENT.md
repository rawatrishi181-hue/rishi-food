# Deployment Guide - Rishi Food Ordering App

This project is structured as a **Monorepo** using npm workspaces. You can deploy the frontend and backend separately or together.

## 🚀 Option 1: Vercel (Recommended for both)

Vercel is already configured via `vercel.json` in the root.

1.  Connect your GitHub repository to Vercel.
2.  Vercel will automatically detect the settings from `vercel.json`.
3.  **Environment Variables**:
    - Add `MONGO_URI` (Your MongoDB Atlas connection string).
    - Add `JWT_SECRET` (A strong random string).
    - Add `VITE_API_URL` (The URL of your deployed backend).

## 🚀 Option 2: Separate Platforms (Best Performance)

### Backend (Server) - Deploy to **Render** or **Railway**
1.  **Root Directory**: Set to `backend`.
2.  **Build Command**: `npm install`
3.  **Start Command**: `npm start`
4.  **Environment Variables**:
    - `PORT`: 5000 (or as provided by the host)
    - `MONGO_URI`: Your MongoDB Atlas string
    - `JWT_SECRET`: Your secret key
    - `NODE_ENV`: production

### Frontend (Client) - Deploy to **Vercel** or **Netlify**
1.  **Root Directory**: Set to `frontend`.
2.  **Build Command**: `npm run build`
3.  **Output Directory**: `dist`
4.  **Environment Variables**:
    - `VITE_API_URL`: Your deployed backend API URL (e.g., `https://your-backend.render.com/api`)

## 🛠 Manual VPS Deployment (Nginx/PM2)

1.  Clone the repo on your server.
2.  Install dependencies: `npm run install-all` from the root.
3.  Build frontend: `npm run build:frontend`.
4.  Run backend with PM2: `cd backend && pm2 start server.js --name rishi-backend`.
5.  Configure Nginx to serve `frontend/dist` as static files and proxy `/api` to `localhost:5000`.

## 📦 Project Structure
- `/backend`: Express API, Models, Controllers.
- `/frontend`: React/Vite Frontend code.
- `/docs`: Project documentation and optimization reports.
