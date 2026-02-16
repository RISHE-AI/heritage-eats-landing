# Heritage Eats Backend

A production-ready Node.js + Express + MongoDB backend for the Heritage Eats frontend application.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account

### Installation

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```env
MONGO_URI=mongodb+srv://username:password@clustername.bffkle1.mongodb.net/database?retryWrites=true&w=majority
PORT=5000
```

4. Start the server:

```bash
npm start
```

The server will run on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── server.js                 # Express app setup and middleware
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (MongoDB URI, PORT)
├── config/
│   └── db.js                # MongoDB connection setup
├── models/
│   ├── Customer.js          # Customer schema
│   ├── Product.js           # Product schema
│   ├── Order.js             # Order schema
│   └── Review.js            # Review schema
├── controllers/
│   ├── customerController.js
│   ├── productController.js
│   ├── orderController.js
│   └── reviewController.js
├── routes/
│   ├── customerRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   └── reviewRoutes.js
└── middleware/
    └── errorHandler.js      # Centralized error handling
```

## 🗄️ Database Models

### Customer

```javascript
{
  name: String (required),
  phone: String (required),
  email: String,
  address: String (required),
  createdAt: Date
}
```

### Product

```javascript
{
  name_en: String (required),
  name_ta: String,
  category: String,
  price: Number (required),
  available: Boolean,
  weights: [String],
  ingredients_en: [String],
  ingredients_ta: [String],
  benefits_en: [String],
  benefits_ta: [String]
}
```

### Order

```javascript
{
  customer: ObjectId (ref: Customer),
  items: [
    {
      product: String,
      weight: String,
      quantity: Number,
      price: Number
    }
  ],
  deliveryCharge: Number,
  totalAmount: Number (required),
  paymentStatus: String (enum: pending, paid, failed, refunded),
  orderStatus: String,
  createdAt: Date
}
```

### Review

```javascript
{
  customerName: String,
  rating: Number (required),
  comment: String,
  createdAt: Date
}
```

## 🔌 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Health Check

```
GET /api/health
Response: { status: "OK", message: "Server is running" }
```

### Customers

```
POST   /api/customers              # Create customer
GET    /api/customers              # Get all customers
```

### Products

```
GET    /api/products               # Get all products
POST   /api/products               # Create product
PUT    /api/products/:id           # Update product
DELETE /api/products/:id           # Delete product
```

### Orders

```
POST   /api/orders                 # Create order
GET    /api/orders                 # Get all orders
GET    /api/orders/:id             # Get order by ID
```

### Reviews

```
POST   /api/reviews                # Create review
GET    /api/reviews                # Get all reviews
```

## 🛠️ Development

Run in development mode with file watching:

```bash
npm run dev
```

## 📝 Request/Response Examples

### Create Customer

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "email": "john@example.com",
    "address": "123 Main St"
  }'
```

### Get All Products

```bash
curl http://localhost:5000/api/products
```

### Create Order

```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer": "customer_id",
    "items": [
      {
        "product": "product_id",
        "weight": "500g",
        "quantity": 1,
        "price": 250
      }
    ],
    "deliveryCharge": 50,
    "totalAmount": 300
  }'
```

## 🔐 Features

- ✅ CORS enabled for frontend communication
- ✅ Centralized error handling
- ✅ MongoDB Atlas integration via Mongoose
- ✅ Health check endpoint
- ✅ Environment variables via dotenv
- ✅ RESTful API design
- ✅ Data validation at schema level

## ⚙️ Configuration

All configuration is managed through environment variables in `.env`. Update the following:

- `MONGO_URI`: Your MongoDB Atlas connection string
- `PORT`: Server port (default: 5000)

## 🚨 Error Handling

The backend uses centralized error handling via the `errorHandler` middleware. All errors are logged and returned as JSON:

```json
{
  "message": "Error message here"
}
```

## 🧪 Testing APIs

You can test the APIs using:

- cURL
- Postman
- Insomnia
- Thunder Client (VS Code)

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

## 📄 License

MIT
