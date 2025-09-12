# 💰 Budget Tracker - Smart Personal Finance Management

A comprehensive full-stack web application for managing personal finances, budgets, investments, and financial goals. Built with modern technologies and AI-powered insights to help users make informed financial decisions.

## 🚀 Live Demo

**Deployed on Render:** [https://project-capstone-frontend.onrender.com](https://project-capstone-frontend.onrender.com) 

*Experience seamless financial management with cloud-hosted reliability and performance.*

## ✨ Features

### 🔐 **Authentication & Security**
- **Secure User Registration** - Create account with email validation
- **JWT Authentication** - Secure login sessions with token-based auth
- **Protected Routes** - Role-based access control
- **Password Encryption** - BCrypt hashing for data security

### 📊 **Transaction Management**
- **Add/Edit/Delete Transactions** - Complete CRUD operations
- **Expense & Income Tracking** - Categorized financial records
- **Real-time Updates** - Instant transaction processing
- **Transaction History** - Comprehensive financial timeline

### 💳 **Smart Budget Management**
- **Category-based Budgets** - Set limits for spending categories
- **Auto-budget Creation** - Intelligent category detection
- **Budget Monitoring** - Real-time spending vs. budget tracking
- **Visual Progress Indicators** - Intuitive budget visualization

### 🎯 **Financial Goals**
- **Goal Setting** - Create and track financial objectives
- **Progress Tracking** - Monitor goal achievement
- **Target Date Management** - Time-based goal planning
- **Achievement Analytics** - Goal completion insights

### 📈 **Investment Portfolio**
- **Investment Tracking** - Stocks, mutual funds, crypto support
- **Portfolio Management** - Track units, current prices, performance
- **Investment Analytics** - ROI and performance metrics
- **Diversification Insights** - Portfolio balance monitoring

### 👥 **Group Financial Management**
- **Shared Expenses** - Group spending coordination
- **Collaborative Budgeting** - Team financial planning
- **Member Management** - Add/remove group participants
- **Split Bill Functionality** - Fair expense distribution

### 📊 **Advanced Analytics**
- **Interactive Charts** - Chart.js powered visualizations
- **Spending Patterns** - AI-driven insights into financial habits
- **Trend Analysis** - Historical data interpretation
- **Financial Health Score** - Overall financial wellness tracking

### 🤖 **AI-Powered Features**
- **Smart Transaction Parsing** - AI categorization of expenses
- **Financial Insights** - Intelligent spending recommendations
- **Predictive Analytics** - Future spending forecasts
- **Natural Language Processing** - Enhanced user experience

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern UI library with latest features
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS 4** - Utility-first styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Chart.js & Recharts** - Data visualization libraries
- **React Hot Toast** - Beautiful notification system
- **Framer Motion** - Smooth animations and transitions
- **Heroicons & Lucide React** - Professional icon sets

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js 4** - Web application framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Token authentication
- **BCrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing

### **AI Integration**
- **OpenRouter API** - Multi-model AI access
- **Mistral AI** - Advanced language processing
- **Smart Parsing** - Intelligent transaction categorization

### **Deployment & DevOps**
- **Render** - Cloud hosting platform
- **Environment Management** - Secure configuration handling
- **Production Optimization** - Build optimization and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/budget-tracker.git
   cd budget-tracker
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Environment Variables**

   **Backend (.env):**
   ```env
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/budget_tracker
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   ```

   **Frontend (.env):**
   ```env
   VITE_BACKEND_URL=http://localhost:5000/api
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key
   ```

5. **Run the Application**
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

6. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/api`

## 📱 Application Structure

```
budget-tracker/
├── server/                 # Backend API
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   ├── utils/             # Helper functions
│   └── index.js           # Server entry point
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── lib/           # API configuration
│   │   ├── utils/         # Frontend utilities
│   │   └── App.jsx        # Main app component
│   └── dist/              # Production build
└── README.md              # Project documentation
```

## 🔒 Security Features

- **JWT Token Authentication** - Secure session management
- **Password Hashing** - BCrypt encryption
- **CORS Protection** - Configured cross-origin policies
- **Input Validation** - Server-side data validation
- **Environment Security** - Secure configuration management

## 🌟 Key Highlights

- **Production Ready** - Deployed and optimized for performance
- **Responsive Design** - Mobile-first, works on all devices
- **Real-time Updates** - Instant data synchronization
- **AI-Enhanced** - Smart categorization and insights
- **Scalable Architecture** - Built for growth and expansion
- **Modern Stack** - Latest technologies and best practices

## 🤝 Development Process

This project was developed using modern development practices and tools:

- **AI-Assisted Development** - Enhanced productivity with ChatGPT integration
- **Smart Code Generation** - Accelerated development with emergent.sh platform
- **Best Practices** - Following industry standards and conventions
- **Continuous Testing** - Comprehensive testing throughout development
- **Performance Optimization** - Optimized for speed and efficiency

## 📈 Performance & Analytics

- **Bundle Optimization** - Code splitting and lazy loading
- **Caching Strategy** - Optimized resource loading
- **Database Indexing** - Fast query performance
- **CDN Ready** - Static asset optimization
- **Performance Monitoring** - Real-time performance tracking

## 🚀 Deployment

### Render Deployment

The application is configured for seamless Render deployment:

1. **Automatic Deployments** - Git-based deployment pipeline
2. **Environment Management** - Secure variable handling
3. **SSL Certificates** - HTTPS encryption
4. **Global CDN** - Fast content delivery
5. **Monitoring** - Built-in performance monitoring

### Deploy Your Own

1. Fork this repository
2. Connect to Render
3. Set environment variables
4. Deploy with one click

## 🤖 AI Integration Details

- **OpenRouter Integration** - Multi-model AI access for enhanced features
- **Transaction Analysis** - AI-powered expense categorization
- **Financial Insights** - Machine learning driven recommendations
- **Natural Language Processing** - Improved user interaction

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user

### Transaction Endpoints
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budget Endpoints
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

*[Additional endpoints for goals, investments, and groups...]*

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Modern Web Technologies** - Built with the latest and greatest
- **Open Source Community** - Standing on the shoulders of giants
- **AI Development Tools** - Enhanced with ChatGPT and emergent.sh
- **Render Platform** - Reliable hosting and deployment infrastructure

## 📞 Support

For support, questions, or contributions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ using modern web technologies, AI assistance, and deployed on Render for reliability and performance.**

*Experience the future of personal finance management today!*

