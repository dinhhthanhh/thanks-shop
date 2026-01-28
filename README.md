# 🏠 Thanks-Shop - E-Commerce Web Application

A complete, production-style full-stack e-commerce web application for household cleaning products built with the MERN stack.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Default Credentials](#default-credentials)
- [Screenshots](#screenshots)

## ✨ Features

### User Features
- User authentication (register/login/logout)
- Browse products with search and filter
- Filter by category and price range
- View detailed product information
- Add products to shopping cart
- Update cart quantities
- Checkout and place orders
- View order history
- Update user profile

### Admin Features
- Admin dashboard with statistics
- Product management (CRUD operations)
- Category management
- Order management with status updates
- Inventory tracking with low-stock warnings
- Revenue analytics
- Best-selling products report

### Business Logic
- Automatic stock reduction on checkout
- Transaction-based order processing
- JWT-based authentication
- Role-based access control
- Input validation and error handling

## 🚀 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

## 📁 Project Structure

```
thanks-shop/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── admin.js
│   │   └── errorHandler.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── admin.js
│   ├── scripts/
│   │   └── seed.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Loading.jsx
    │   │   │   └── ErrorMessage.jsx
    │   │   ├── products/
    │   │   │   ├── ProductCard.jsx
    │   │   │   └── ProductList.jsx
    │   │   └── admin/
    │   │       ├── AdminSidebar.jsx
    │   │       └── StatsCard.jsx
    │   ├── pages/
    │   │   ├── user/
    │   │   │   ├── Home.jsx
    │   │   │   ├── Login.jsx
    │   │   │   ├── Register.jsx
    │   │   │   ├── Products.jsx
    │   │   │   ├── ProductDetail.jsx
    │   │   │   ├── Cart.jsx
    │   │   │   ├── Checkout.jsx
    │   │   │   ├── Orders.jsx
    │   │   │   └── Profile.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── Products.jsx
    │   │       ├── Orders.jsx
    │   │       ├── Inventory.jsx
    │   │       └── Revenue.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   ├── ProtectedRoute.jsx
    │   │   └── AdminRoute.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── .env
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

## 📦 Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **MongoDB Compass** (Recommended for viewing database) - [Download](https://www.mongodb.com/try/download/compass)
- **npm** or **yarn**

### Installing MongoDB (Windows)

1. Download MongoDB Community Server from the link above
2. Run the installer and choose "Complete" installation
3. Check "Install MongoDB as a Service" during installation
4. MongoDB will automatically start on system boot

### Installing MongoDB Compass (GUI Database Viewer)

1. Download MongoDB Compass from the link above
2. Install and launch the application
3. Connect to your local database:
   - **Connection String**: `mongodb://localhost:27017`
   - Click "Connect"
4. You'll see all your databases listed, including `thanksshop`

### Viewing Your Database

Once you've seeded the database, you can view it in multiple ways:

#### Option 1: MongoDB Compass (Recommended - Visual Interface)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Click on `thanksshop` database
4. Explore collections: `users`, `products`, `categories`, `carts`, `orders`
5. View, filter, and edit documents directly

#### Option 2: MongoDB Shell (Command Line)
```bash
# Connect to MongoDB
mongosh

# Switch to thanksshop database
use thanksshop

# View all collections
show collections

# View all products
db.products.find().pretty()

# View all users
db.users.find().pretty()

# View all orders
db.orders.find().pretty()

# Count documents
db.products.countDocuments()

# Exit
exit
```

#### Option 3: VS Code Extension
Install "MongoDB for VS Code" extension from Visual Studio Code marketplace to view and manage your database directly in VS Code.

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd thanks-shop
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/thanksshop
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@thanksshop.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### 1. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 2. Seed the Database

```bash
cd backend
npm run seed
```

This will create:
- 2 users (1 admin, 1 regular user)
- 5 categories
- 20+ household products
- Sample orders

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔑 Default Credentials

### Admin Account
- **Email:** admin@thanksshop.com
- **Password:** admin123

### Regular User Account
- **Email:** john@example.com
- **Password:** password123

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/profile     - Get user profile (Protected)
PUT    /api/auth/profile     - Update user profile (Protected)
```

### Products
```
GET    /api/products         - Get all products (with filters)
GET    /api/products/:id     - Get single product
POST   /api/products         - Create product (Admin)
PUT    /api/products/:id     - Update product (Admin)
DELETE /api/products/:id     - Delete product (Admin)
```

### Categories
```
GET    /api/categories       - Get all categories
GET    /api/categories/:id   - Get single category
POST   /api/categories       - Create category (Admin)
PUT    /api/categories/:id   - Update category (Admin)
DELETE /api/categories/:id   - Delete category (Admin)
```

### Cart
```
GET    /api/cart             - Get user's cart (Protected)
POST   /api/cart             - Add to cart (Protected)
PUT    /api/cart             - Update cart item (Protected)
DELETE /api/cart/:productId  - Remove from cart (Protected)
DELETE /api/cart             - Clear cart (Protected)
```

### Orders
```
GET    /api/orders           - Get user's orders (Protected)
GET    /api/orders/:id       - Get single order (Protected)
POST   /api/orders           - Create order from cart (Protected)
```

### Admin
```
GET    /api/admin/orders     - Get all orders (Admin)
PUT    /api/admin/orders/:id - Update order status (Admin)
GET    /api/admin/stats      - Get dashboard statistics (Admin)
GET    /api/admin/revenue    - Get revenue data (Admin)
GET    /api/admin/inventory  - Get inventory status (Admin)
```

## 🎯 Key Features Implementation

### Authentication Flow
1. User registers with email/password
2. Password is hashed with bcrypt (10 salt rounds)
3. JWT token generated on login
4. Token stored in localStorage
5. Token sent with protected API requests
6. Middleware validates token and user role

### Inventory Management
1. Stock quantity tracked in Product model
2. Checkout validates stock availability
3. Stock reduced atomically using MongoDB transactions
4. Admin can view low-stock products (< 10 units)
5. Prevents checkout if insufficient stock

### Order Processing
1. User adds items to cart
2. Checkout validates cart and stock
3. Order created with snapshot of items/prices
4. Stock reduced for each product atomically
5. Cart cleared after successful order
6. Admin can update order status
7. User can view order history

## 📱 Pages and Routes

### User Pages
- `/` - Home page with featured products
- `/products` - Products listing with filters
- `/products/:id` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/profile` - User profile
- `/login` - Login page
- `/register` - Registration page

### Admin Pages
- `/admin/dashboard` - Statistics and overview
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/inventory` - Inventory tracking
- `/admin/revenue` - Revenue analytics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (User/Admin)
- Protected routes on frontend
- Input validation on backend
- MongoDB injection prevention
- CORS enabled
- HTTP-only approach recommended for production

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- TailwindCSS for consistent styling
- Loading states
- Error handling
- Success notifications
- Form validation
- Intuitive navigation
- Clean and modern layout

## 📝 Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: ObjectId (ref: Category),
  image: String,
  stock: Number,
  createdAt: Date
}
```

### Category
```javascript
{
  name: String (unique),
  description: String,
  createdAt: Date
}
```

### Cart
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number
  }],
  updatedAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number
  }],
  totalPrice: Number,
  status: String (enum: ['pending', 'shipped', 'completed', 'cancelled']),
  createdAt: Date
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB is listening on port 27017

### Backend Server Issues
- Check if port 5000 is available
- Verify all environment variables are set
- Check MongoDB connection

### Frontend Build Issues
- Clear node_modules and reinstall
- Check VITE_API_URL in .env
- Ensure backend is running

## 🚀 Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Set up MongoDB Atlas or production database
4. Configure CORS for your frontend domain
5. Use PM2 or similar for process management

### Frontend
1. Run `npm run build`
2. Deploy `dist` folder to hosting service
3. Update VITE_API_URL to production backend URL

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Created as a university-level full-stack e-commerce demonstration project.

---

**Happy Shopping! 🛒**
