# 🎯 DFashion Admin Dashboard Setup Guide

## 📋 **Overview**
Complete Angular admin dashboard with Node.js API integration for DFashion e-commerce platform.

## 🚀 **Features Implemented**

### ✅ **Backend API (Node.js)**
- **Authentication System**
  - Admin login with role-based access
  - JWT token authentication
  - Permission-based authorization
  - Session management

- **User Management API**
  - CRUD operations for users
  - Role and department management
  - User activation/deactivation
  - Password management

- **Product Management API**
  - Product CRUD operations
  - Product approval workflow
  - Featured products management
  - Inventory tracking

- **Order Management API**
  - Order status tracking
  - Payment processing
  - Refund management
  - Order analytics

- **Dashboard Analytics API**
  - Real-time statistics
  - Sales reports
  - User growth metrics
  - Revenue analytics

### ✅ **Frontend Dashboard (Angular)**
- **Modern UI/UX**
  - Material Design components
  - Responsive layout
  - Dark/Light theme support
  - Interactive charts (Chart.js)

- **Authentication**
  - Secure admin login
  - Role-based navigation
  - Permission guards
  - Auto-logout on token expiry

- **User Management**
  - User listing with filters
  - Add/Edit user dialog
  - Role assignment
  - Status management

- **Dashboard Analytics**
  - Real-time statistics cards
  - Interactive charts
  - Recent activities
  - System status monitoring

## 🛠️ **Installation & Setup**

### **1. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Install additional packages for admin features
npm install bcryptjs jsonwebtoken express-validator

# Start MongoDB (if not running)
net start MongoDB

# Start the backend server
node server.js
```

### **2. Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install Angular Material and Charts
ng add @angular/material
npm install ng2-charts chart.js

# Install additional dependencies
npm install @angular/cdk

# Start the Angular development server
ng serve
```

## 🔐 **Demo Admin Accounts**

### **Super Administrator**
- **Email**: `superadmin@dfashion.com`
- **Password**: `admin123`
- **Access**: Full system access

### **Sales Manager**
- **Email**: `sales.manager@dfashion.com`
- **Password**: `sales123`
- **Access**: Sales and order management

### **Marketing Manager**
- **Email**: `marketing.manager@dfashion.com`
- **Password**: `marketing123`
- **Access**: Marketing and analytics

### **Account Manager**
- **Email**: `accounts.manager@dfashion.com`
- **Password**: `accounts123`
- **Access**: Financial and accounting

### **Support Manager**
- **Email**: `support.manager@dfashion.com`
- **Password**: `support123`
- **Access**: Customer support and tickets

## 🌐 **Access URLs**

### **Admin Dashboard**
- **URL**: http://localhost:4200/admin
- **Login**: http://localhost:4200/admin/login

### **API Endpoints**
- **Base URL**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Admin API**: http://localhost:5000/api/admin/*

## 📊 **Dashboard Features**

### **1. Dashboard Overview**
- Real-time statistics
- User growth charts
- Order trends
- Revenue analytics
- Recent activities
- System status

### **2. User Management**
- User listing with pagination
- Advanced filtering (role, department, status)
- Add/Edit users
- Role assignment
- Account activation/deactivation
- Password management

### **3. Product Management** (Coming Soon)
- Product listing
- Product approval workflow
- Inventory management
- Featured products

### **4. Order Management** (Coming Soon)
- Order tracking
- Status updates
- Payment management
- Refund processing

### **5. Analytics** (Coming Soon)
- Sales reports
- User analytics
- Revenue tracking
- Performance metrics

## 🔧 **API Integration**

### **Authentication Headers**
```typescript
// All admin API calls require authentication
headers: {
  'Authorization': 'Bearer <jwt_token>',
  'Content-Type': 'application/json'
}
```

### **Sample API Calls**

#### **Login**
```typescript
POST /api/auth/admin/login
{
  "email": "superadmin@dfashion.com",
  "password": "admin123"
}
```

#### **Get Users**
```typescript
GET /api/admin/users?page=1&limit=10&role=admin
Authorization: Bearer <token>
```

#### **Create User**
```typescript
POST /api/admin/users
Authorization: Bearer <token>
{
  "fullName": "John Doe",
  "email": "john@dfashion.com",
  "username": "johndoe",
  "password": "password123",
  "role": "sales_manager",
  "department": "sales"
}
```

## 🎨 **UI Components**

### **Material Design**
- Cards and layouts
- Data tables with sorting/filtering
- Form controls and validation
- Dialogs and modals
- Snackbar notifications
- Progress indicators

### **Charts & Analytics**
- Line charts for trends
- Bar charts for comparisons
- Doughnut charts for distributions
- Real-time data updates

## 🔒 **Security Features**

### **Authentication**
- JWT token-based authentication
- Role-based access control
- Permission-based route guards
- Session timeout handling

### **Authorization**
- Module-level permissions
- Action-based access control
- Department-based restrictions
- Admin hierarchy support

## 🚀 **Getting Started**

1. **Start Backend Server**
   ```bash
   cd backend && node server.js
   ```

2. **Start Frontend**
   ```bash
   cd frontend && ng serve
   ```

3. **Access Admin Dashboard**
   - Go to: http://localhost:4200/admin/login
   - Use demo credentials above
   - Explore the dashboard features

## 📱 **Responsive Design**

- **Desktop**: Full-featured dashboard
- **Tablet**: Optimized layout
- **Mobile**: Collapsible sidebar, touch-friendly

## 🔄 **Real-time Features**

- Live dashboard updates
- Real-time notifications
- Auto-refresh data
- WebSocket support (planned)

## 🎯 **Next Steps**

1. **Complete Product Management**
2. **Implement Order Management**
3. **Add Advanced Analytics**
4. **Integrate Payment Systems**
5. **Add Notification System**
6. **Implement File Upload**
7. **Add Export/Import Features**

## 🐛 **Troubleshooting**

### **Common Issues**

1. **MongoDB Connection Error**
   - Ensure MongoDB is running: `net start MongoDB`
   - Check connection string in backend config

2. **CORS Issues**
   - Backend CORS is configured for localhost:4200
   - Check browser console for errors

3. **Authentication Errors**
   - Clear browser localStorage
   - Check token expiration
   - Verify API endpoints

4. **Module Import Errors**
   - Run `npm install` in both directories
   - Check Angular Material installation

## 📞 **Support**

For issues or questions:
1. Check browser console for errors
2. Verify API responses in Network tab
3. Check backend logs
4. Ensure all dependencies are installed

---

**🎉 Your DFashion Admin Dashboard is ready to use!**
