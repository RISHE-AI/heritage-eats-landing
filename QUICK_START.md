# 🚀 Quick Start Guide - Heritage Eats Full Stack

## Backend Status: ✅ RUNNING on http://localhost:5000

---

## 📦 What's Implemented

### Backend (Node.js + Express + MongoDB)

- ✅ Server running on port 5000
- ✅ MongoDB Atlas connected
- ✅ All CRUD operations
- ✅ CORS enabled
- ✅ Error handling
- ✅ Health check endpoint working

### Frontend (Vite + React)

- ✅ Already built and working
- ✅ No changes needed
- ✅ Ready to consume backend APIs

---

## 🎯 How to Run Everything

### Terminal 1: Start Backend (if not already running)

```bash
cd backend
npm start
```

Backend will run on: `http://localhost:5000`

### Terminal 2: Start Frontend

```bash
npm run dev
```

Frontend will run on: `http://localhost:5173` (or your configured port)

---

## 🔗 Connect Frontend to Backend

### Quick Test (No Changes Needed)

The backend is already accessible at `http://localhost:5000`

### In Your React Components

Use fetch to call the backend:

```javascript
// Fetch products
const response = await fetch("http://localhost:5000/api/products");
const data = await response.json();
console.log(data);

// Create customer
const response = await fetch("http://localhost:5000/api/customers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John",
    phone: "1234567890",
    address: "123 Main St",
  }),
});
```

### Alternative: Use Vite Proxy (Optional)

Edit `vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

Then just call: `fetch('/api/products')`

---

## 📡 Available API Endpoints

### Health Check

```
GET http://localhost:5000/api/health
```

### Customers

```
POST http://localhost:5000/api/customers
GET  http://localhost:5000/api/customers
```

### Products

```
GET    http://localhost:5000/api/products
POST   http://localhost:5000/api/products
PUT    http://localhost:5000/api/products/:id
DELETE http://localhost:5000/api/products/:id
```

### Orders

```
POST http://localhost:5000/api/orders
GET  http://localhost:5000/api/orders
GET  http://localhost:5000/api/orders/:id
```

### Reviews

```
POST http://localhost:5000/api/reviews
GET  http://localhost:5000/api/reviews
```

---

## 🧪 Test Backend with cURL

### Test Health (verify server is running)

```bash
curl http://localhost:5000/api/health
```

### Get Products

```bash
curl http://localhost:5000/api/products
```

### Create Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "address": "123 Main St"
  }'
```

### Create Product

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Pickle",
    "category": "Condiments",
    "price": 150
  }'
```

---

## 📂 Project Structure

```
heritage-eats-landing/
├── backend/                    # NEW: Node.js + Express backend
│   ├── server.js              # Express app (RUNNING)
│   ├── package.json           # Dependencies installed
│   ├── .env                   # MongoDB URI configured
│   ├── config/db.js           # DB connection
│   ├── models/                # Mongoose schemas
│   ├── controllers/           # Business logic
│   ├── routes/                # API endpoints
│   └── middleware/            # Error handling
│
├── src/                        # Frontend (UNCHANGED)
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   └── ...
│
├── BACKEND_STATUS.md           # Detailed documentation
├── BACKEND_INTEGRATION.md      # Integration guide
├── QUICK_START.md             # This file
└── [other frontend files]
```

---

## 🛠️ Configuration

### Backend Environment (.env)

```
MONGO_URI=mongodb+srv://tdhms:admin12345@clusterhms.bffkle1.mongodb.net/homemade_delights?retryWrites=true&w=majority
PORT=5000
```

### Change Backend Port (if needed)

Edit `.env` and change `PORT=5000` to your desired port, then restart the server.

---

## ✨ What Works Out of the Box

✅ Backend server running and responding to requests
✅ MongoDB Atlas database connected and working
✅ All CRUD operations functional
✅ CORS enabled for frontend calls
✅ Error handling configured
✅ Health check endpoint working
✅ Data validation at schema level

---

## 🚀 Production Deployment

The backend is production-ready. To deploy:

1. Set up MongoDB Atlas (already done)
2. Deploy to Heroku, Railway, Vercel, or any Node.js hosting
3. Set environment variables in hosting platform
4. Frontend calls the deployed backend URL

Example production setup:

```javascript
// In frontend, use environment variable
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
fetch(`${API_URL}/api/products`);
```

---

## 🆘 Troubleshooting

### Backend not starting?

```bash
cd backend
npm install  # Reinstall if needed
npm start
```

### Port 5000 already in use?

Change in `backend/.env`:

```
PORT=5001  # or any available port
```

### Can't connect to MongoDB?

- Check MONGO_URI in `backend/.env`
- Verify MongoDB Atlas cluster is accessible
- Check if your IP is whitelisted in Atlas

### CORS errors?

- Backend has CORS enabled by default
- Check browser console for details
- Verify frontend is using correct backend URL

### API returns empty data?

- Check if MongoDB has data
- Use Postman to test API endpoints
- Check backend logs in terminal

---

## 📚 Documentation

- **[BACKEND_STATUS.md](BACKEND_STATUS.md)** - Full backend documentation
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Integration guide
- **[backend/README.md](backend/README.md)** - Backend setup & API reference

---

## 🎉 You're All Set!

1. ✅ Backend is running
2. ✅ Frontend is ready
3. ✅ APIs are available
4. ✅ Database is connected

Start both servers and begin building! 🚀

---

**Need help?** Check the documentation files or review the API endpoints in Postman.
