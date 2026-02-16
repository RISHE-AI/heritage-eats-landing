# Backend Integration Guide for Heritage Eats Frontend

## Overview

The Heritage Eats backend is now fully implemented and running on `http://localhost:5000`. This guide explains how to integrate it with your existing Vite + React frontend.

## ✅ Backend Status

- **Server**: Running on `localhost:5000`
- **Database**: MongoDB Atlas connected
- **Health Check**: `GET http://localhost:5000/api/health` ✓
- **CORS**: Enabled for all origins

## 🔗 Frontend Integration

### Option 1: Using Environment Variables (Recommended)

1. **Update Vite config** (if using proxy):

   Edit `vite.config.ts`:

   ```typescript
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

2. **Create `.env.local` in frontend root**:

   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Use in frontend code**:

   ```typescript
   const API_BASE_URL =
     import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

   // Example API call
   const response = await fetch(`${API_BASE_URL}/api/customers`, {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ name, phone, email, address }),
   });
   ```

### Option 2: Direct API Calls

Simply call the backend endpoints directly:

```typescript
// Fetch products
const response = await fetch("http://localhost:5000/api/products");
const products = await response.json();

// Create customer
const response = await fetch("http://localhost:5000/api/customers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John",
    phone: "9876543210",
    address: "Main St",
  }),
});
```

## 📡 API Endpoints Available

### Customers

```
POST   /api/customers              # Create customer
GET    /api/customers              # List all customers
```

### Products

```
GET    /api/products               # Get all products
POST   /api/products               # Create product (admin)
PUT    /api/products/:id           # Update product (admin)
DELETE /api/products/:id           # Delete product (admin)
```

### Orders

```
POST   /api/orders                 # Create order
GET    /api/orders                 # List all orders
GET    /api/orders/:id             # Get order details
```

### Reviews

```
POST   /api/reviews                # Create review
GET    /api/reviews                # List all reviews
```

## 🚀 Running Together

### Terminal 1: Backend

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Terminal 2: Frontend

```bash
# From project root
npm run dev
# Vite dev server runs on http://localhost:5173
```

Both will run simultaneously on different ports.

## 📝 Example Implementation in React Component

```typescript
import { useState, useEffect } from 'react';

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data.data || data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product._id}>
          <h3>{product.name_en}</h3>
          <p>₹{product.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ Admin Operations

### Load Sample Products

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Homemade Pickle",
    "name_ta": "வீட்டு ஊறுகாய்",
    "category": "Condiments",
    "price": 150,
    "available": true,
    "weights": ["200g", "500g", "1kg"],
    "ingredients_en": ["Mangoes", "Spices"],
    "ingredients_ta": ["மாம்பழம்", "மசாலா"]
  }'
```

### Create Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "phone": "9876543210",
    "email": "raj@example.com",
    "address": "123 Main Street, Chennai"
  }'
```

## 🧪 Testing the Connection

Test if backend is running:

```bash
curl http://localhost:5000/api/health
# Response: {"status":"OK","message":"Server is running"}
```

Test products endpoint:

```bash
curl http://localhost:5000/api/products
```

## 📋 Important Notes

1. **Supabase is COMPLETELY IGNORED** - Backend uses MongoDB Atlas only
2. **Frontend is UNCHANGED** - No UI/component modifications needed
3. **CORS is ENABLED** - Frontend can call backend from any origin
4. **MongoDB Connection** - Must have valid `.env` with `MONGO_URI`
5. **Port 5000** - Backend requires this port to be free

## 🔍 Troubleshooting

### "Address already in use" error

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### "Cannot connect to MongoDB"

- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas connection string
- Ensure IP is whitelisted in Atlas

### CORS errors

- Backend has CORS enabled by default
- If issues persist, check browser console
- Verify frontend is using correct API URL

## 📚 Additional Resources

- Backend README: [backend/README.md](backend/README.md)
- Express docs: https://expressjs.com/
- Mongoose docs: https://mongoosejs.com/
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Backend is ready for production!** 🎉
