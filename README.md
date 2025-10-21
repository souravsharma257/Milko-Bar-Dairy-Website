# 🥛 Milko Bar Dairy - Full Stack E-commerce Application

A complete dairy products e-commerce platform built with MERN stack (MongoDB, Express.js, React, Node.js). Customers can browse products, place orders, and track deliveries. Admins can manage products, orders, and customer reviews.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Node Version](https://img.shields.io/badge/Node-v14+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-v4+-green)

## ✨ Features

### 👥 Customer Features
- **User Authentication** - Secure login/register with JWT tokens
- **Product Browsing** - Browse dairy products with category filters
- **Advanced Search & Filters** - Search by name, price range, category
- **Shopping Cart** - Add/remove products, update quantities
- **Order Placement** - COD and Online payment options
- **Order Tracking** - Real-time order status updates with timeline
- **Product Reviews** - Rate and review purchased products
- **Email Notifications** - Order confirmation emails

### 🔧 Admin Features
- **Admin Dashboard** - Comprehensive order management
- **Order Management** - Update order status, view customer details
- **Product Management** - Add/edit/delete products
- **Customer Management** - View all customers and their orders
- **Review Moderation** - Manage product reviews

### 📧 Notifications
- **Email Service** - Automated order confirmation emails (MSG91/Gmail)
- **WhatsApp Integration** - Order updates via WhatsApp (Optional)

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Styling
- **Axios** - HTTP requests
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email service

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/souravsharma257/Milko-Bar-Dairy-Website.git
cd milko-bar-dairy
```

### 2. Backend Setup
```bash
# Navigate to backend
cd milko-bar-backend

# Install dependencies
npm install

# Create .env file
touch .env
```


**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use that password in `EMAIL_PASS`
```bash
# Start MongoDB (if not running)
mongod

# Start backend server
npm run dev
# or
node server.js
```

Backend should run on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend
cd ../milko-dairy-frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend should run on `http://localhost:3000`

---

## 🗄️ Database Setup

### Create Admin User
```javascript
// Open MongoDB shell
mongosh

// Use database
use milko-dairy





---

## 📁 Project Structure
```
milko-bar-dairy/
├── milko-bar-backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── emailService.js
│   │   └── whatsappService.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── orderController.js
│   │   ├── productController.js
│   │   └── reviewController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── productRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── milko-dairy-frontend/
    ├── src/
    │   ├── components/
    │   │   ├── RatingStars.jsx
    │   │   ├── ReviewForm.jsx
    │   │   ├── ProductReviews.jsx
    │   │   └── MyReviews.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── AuthModal.jsx
    │   └── index.js
    └── package.json
```

---

## 🔐 Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port | Yes |
| MONGO_URI | MongoDB connection string | Yes |
| JWT_SECRET | JWT signing secret | Yes |
| EMAIL_USER | Gmail address | Yes |
| EMAIL_PASS | Gmail app password | Yes |
| WHATSAPP_API_KEY | MSG91 API key | No |
| WHATSAPP_NUMBER | Business WhatsApp number | No |

---

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
GET    /api/auth/me           - Get current user
PUT    /api/auth/profile      - Update profile
```

### Products
```
GET    /api/products          - Get all products (with filters)
GET    /api/products/:id      - Get single product
POST   /api/products          - Create product (Admin)
PUT    /api/products/:id      - Update product (Admin)
DELETE /api/products/:id      - Delete product (Admin)
```

### Orders
```
POST   /api/orders            - Place new order
GET    /api/orders/myorders   - Get user orders
GET    /api/orders            - Get all orders (Admin)
GET    /api/orders/:id        - Get order by ID
PUT    /api/orders/:id/status - Update order status (Admin)
```

### Reviews
```
POST   /api/reviews/:productId      - Create review
GET    /api/reviews/product/:id     - Get product reviews
GET    /api/reviews/my-reviews      - Get user reviews
PUT    /api/reviews/:id             - Update review
DELETE /api/reviews/:id             - Delete review
```

---

## 🎨 Screenshots

### Customer Interface
- Home Page with product categories
- Product listing with filters
- Shopping cart
- Order tracking with timeline

### Admin Dashboard
- Order management table
- Real-time status updates
- Customer information

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Or use different port in .env
PORT=5001
```

### Email Not Sending
- Verify Gmail App Password is correct
- Check 2-Step Verification is enabled
- Ensure "Less secure app access" is OFF (use App Password instead)

---

## 📝 To-Do / Future Enhancements

- [ ] Payment Gateway Integration (Razorpay/Stripe)
- [ ] Product image upload functionality
- [ ] Advanced admin analytics dashboard
- [ ] Wishlist feature
- [ ] Customer chat support
- [ ] Mobile app version
- [ ] Inventory management system
- [ ] Discount/Coupon system

---

## 👨‍💻 Developer

**Sourav Sharma**
- Email: souravkaushik231@gmail.com
- Location: Shahjahanpur, Rajasthan

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- React.js community
- Node.js ecosystem
- MongoDB documentation
- Tailwind CSS

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: souravkaushik231@gmail.com

---

**Made with ❤️ for Milko Bar Dairy**
