# Deployment Guide for Heritage Eats Landing

This guide covers how to deploy the full stack application (React Frontend + Node.js Backend).

## Prerequisites
- [GitHub Account](https://github.com/)
- [Vercel Account](https://vercel.com/) (For Frontend)
- [Render Account](https://render.com/) (For Backend)
- [MongoDB Atlas Account](https://www.mongodb.com/atlas/database) (For Database)

---

## Part 1: Backend Deployment (Render)
We will deploy the Node.js backend to Render.com as it offers a free tier for web services.

1. **Push Code to GitHub**: Ensure your project is pushed to a GitHub repository.
2. **Create New Web Service**:
   - Log in to your Render dashboard.
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.
3. **Configure Service**:
   - **Name**: `heritage-eats-backend` (or similar)
   - **Root Directory**: `backend` (Important! Our backend is in a generic subdirectory)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - Scroll down to "Environment Variables" and add the following keys from your local `.env` file:
     - `MONGO_URI`: Your MongoDB connection string (Allow access from anywhere `0.0.0.0/0` in MongoDB Atlas Network Access).
     - `JWT_SECRET`: A strong secret string.
     - `PORT`: `10000` (Render sets this automatically, but good to have).
     - `admin_email`: Your admin email.
     - `admin_password`: Your admin password.
     - `EMAIL_USER`: Your email for sending notifications.
     - `EMAIL_PASS`: Your email app password.
     - `RAZORPAY_KEY_ID`: Your Razorpay Key ID.
     - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret.
     - `FRONTEND_URL`: The URL where your frontend will be deployed (e.g., `https://heritage-eats.vercel.app`). **You will update this later after deploying frontend.**
5. **Deploy**: Click **Create Web Service**. Wait for the build to finish.
6. **Start Command**: Ensure the start command is `node server.js` or `npm start` if `start` script is correct.
7. **Copy Backend URL**: Once deployed, copy the service URL (e.g., `https://heritage-eats-backend.onrender.com`). You will need this for the frontend.

---

## Part 2: Frontend Deployment (Vercel)
We will deploy the Vite React frontend to Vercel.

1. **Import Project**:
   - Log in to Vercel.
   - Click **Add New** -> **Project**.
   - Import your GitHub repository.
2. **Configure Project**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `.` (Default is fine, or leave empty if it's the root).
3. **Environment Variables**:
   - Expand **Environment Variables**:
     - `VITE_API_URL`: Paste your **Backend URL** from Part 1 (e.g., `https://heritage-eats-backend.onrender.com`).
       **Note**: Do NOT append `/api` here unless your backend expects it. Our code appends `/api` if you didn't include it, or if `VITE_API_URL` is just the base domain. *Wait, let's double check code: `const API_BASE = import.meta.env.VITE_API_URL || '/api';`. If `VITE_API_URL` is `https://backend.com`, then `API_BASE` is `https://backend.com`. But our calls do `${API_BASE}/products`. So `VITE_API_URL` needs to include `/api` if the backend routes are explicitly mounted there.*
       
       *Wait, backend routes:* `app.use('/api/products', ...)`
       *So if `API_BASE` is `https://backend.com`, then fetch is `https://backend.com/products` -> 404.*
       *So `VITE_API_URL` MUST include `/api` at the end.*
       
       **CORRECT INSTRUCTION**: Set `VITE_API_URL` to `https://heritage-eats-backend.onrender.com/api`
4. **Deploy**: Click **Deploy**.
5. **Copy Frontend URL**: Once deployed, copy the domain (e.g., `https://heritage-eats.vercel.app`).

---

## Part 3: Final Configuration
1. **Update Backend CORS**:
   - Go back to Render -> Your Backend Service -> Environment Variables.
   - Add/Update `FRONTEND_URL` to your new Vercel Frontend URL (e.g., `https://heritage-eats.vercel.app`).
   - This ensures CORS allows requests from your deployed frontend.

2. **Verify**:
   - Open your deployed frontend URL.
   - Try logging in, viewing products, and simulating a purchase to ensure everything connects correctly.

## Troubleshooting
- **CORS Errors**: Check if `FRONTEND_URL` in backend env variables exactly matches your Vercel URL (no trailing slash usually preferred, but check your cors config).
- **Database Connection**: Ensure MongoDB Atlas Network Access allows `0.0.0.0/0` (Allow Access from Anywhere) so Render can connect.
- **Build Failures**: Check the build logs on Render/Vercel. Ensure all dependencies are in `package.json`.
- **"Failed to Load Products"**: This usually means the frontend cannot reach the backend.
  - **Check Env Var Name**: Ensure you used `VITE_API_URL` exactly (uppercase, with `VITE_` prefix). If you used `API_URL` or `FRONTEND_URL`, it will be ignored by Vite.
  - **Redeploy Required**: If you added or changed `VITE_API_URL` *after* the deployment started, you must go to **Deployments** -> **Redeploy** for it to take effect.
  - **Check Value**: Ensure the value is `https://your-backend.onrender.com/api` (it must include `/api` if your backend routes are there).
