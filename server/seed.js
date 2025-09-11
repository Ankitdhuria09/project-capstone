// 🇮🇳 Comprehensive Indian Style Budget Tracker Seed Data
import mongoose from "mongoose";
import User from "./models/User.js";
import Budget from "./models/Budget.js";
import Goal from "./models/Goal.js";
import Group from "./models/Group.js";
import Investment from "./models/Investment.js";
import Transaction from "./models/Transaction.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🇮🇳 MongoDB connected - Starting Indian Budget Tracker Seed ✅");

    
    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Budget.deleteMany(),
      Goal.deleteMany(),
      Group.deleteMany(),
      Investment.deleteMany(),
      Transaction.deleteMany(),
    ]);

    // 1. 👥 USERS - Diverse Indian Profiles
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const users = await User.insertMany([
      {
        username: "Arjun Patel",
        email: "arjun.patel@example.com",
        password: hashedPassword,
      },
      {
        username: "Priya Sharma",
        email: "priya.sharma@example.com",
        password: hashedPassword,
      },
      {
        username: "Rahul Gupta",
        email: "rahul.gupta@example.com",
        password: hashedPassword,
      },
      {
        username: "Sneha Iyer",
        email: "sneha.iyer@example.com",
        password: hashedPassword,
      },
      {
        username: "Vikash Singh",
        email: "vikash.singh@example.com",
        password: hashedPassword,
      },
      // Demo user for easy testing
      {
        username: "Demo User",
        email: "demo1@example.com",
        password: hashedPassword,
      }
    ]);

    const [arjun, priya, rahul, sneha, vikash, demoUser] = users;

    // 2. 💰 BUDGETS - Indian Categories & Realistic Amounts
    await Budget.insertMany([
      // Arjun's Budgets (Software Engineer in Mumbai)
      { userId: arjun._id, category: "Food & Dining", limit: 18000 },
      { userId: arjun._id, category: "Transportation", limit: 8000 },
      { userId: arjun._id, category: "Entertainment", limit: 12000 },
      { userId: arjun._id, category: "Groceries", limit: 15000 },
      { userId: arjun._id, category: "Healthcare", limit: 10000 },
      { userId: arjun._id, category: "Shopping", limit: 20000 },

      // Priya's Budgets (Marketing Manager in Bangalore)
      { userId: priya._id, category: "Rent", limit: 25000 },
      { userId: priya._id, category: "Food & Dining", limit: 15000 },
      { userId: priya._id, category: "Beauty & Personal Care", limit: 8000 },
      { userId: priya._id, category: "Travel", limit: 20000 },
      { userId: priya._id, category: "Groceries", limit: 12000 },

      // Rahul's Budgets (Business Owner in Delhi)
      { userId: rahul._id, category: "Business Expenses", limit: 50000 },
      { userId: rahul._id, category: "Food & Dining", limit: 25000 },
      { userId: rahul._id, category: "Transportation", limit: 15000 },
      { userId: rahul._id, category: "Family", limit: 30000 },

      // Sneha's Budgets (Doctor in Chennai)
      { userId: sneha._id, category: "Medical Equipment", limit: 40000 },
      { userId: sneha._id, category: "Education", limit: 20000 },
      { userId: sneha._id, category: "Food & Dining", limit: 12000 },
      { userId: sneha._id, category: "Healthcare", limit: 15000 },

      // Vikash's Budgets (Student in Pune)
      { userId: vikash._id, category: "Education", limit: 10000 },
      { userId: vikash._id, category: "Food & Dining", limit: 8000 },
      { userId: vikash._id, category: "Entertainment", limit: 5000 },
      { userId: vikash._id, category: "Transportation", limit: 3000 },

      // Demo User Budgets
      { userId: demoUser._id, category: "Food & Dining", limit: 15000 },
      { userId: demoUser._id, category: "Transportation", limit: 8000 },
      { userId: demoUser._id, category: "Entertainment", limit: 10000 },
    ]);

    // 3. 🎯 GOALS - Indian Dreams & Aspirations
    await Goal.insertMany([
      // Arjun's Goals
      {
        userId: arjun._id,
        name: "Royal Enfield Himalayan",
        description: "Dream bike for Leh-Ladakh trip",
        targetAmount: 250000,
        currentAmount: 85000,
      },
      {
        userId: arjun._id,
        name: "Emergency Fund",
        description: "6 months salary backup",
        targetAmount: 600000,
        currentAmount: 180000,
      },

      // Priya's Goals
      {
        userId: priya._id,
        name: "Europe Vacation",
        description: "15-day Europe tour with family",
        targetAmount: 400000,
        currentAmount: 125000,
      },
      {
        userId: priya._id,
        name: "iPhone 16 Pro",
        description: "Upgrade from iPhone 12",
        targetAmount: 140000,
        currentAmount: 95000,
      },

      // Rahul's Goals
      {
        userId: rahul._id,
        name: "Home Down Payment",
        description: "3BHK in Noida",
        targetAmount: 2500000,
        currentAmount: 850000,
      },
      {
        userId: rahul._id,
        name: "BMW 3 Series",
        description: "Premium sedan for business",
        targetAmount: 5500000,
        currentAmount: 1200000,
      },

      // Sneha's Goals
      {
        userId: sneha._id,
        name: "Clinic Equipment Upgrade",
        description: "Latest medical equipment",
        targetAmount: 800000,
        currentAmount: 320000,
      },
      {
        userId: sneha._id,
        name: "US Medical Conference",
        description: "Cardiology conference in Boston",
        targetAmount: 350000,
        currentAmount: 150000,
      },

      // Vikash's Goals
      {
        userId: vikash._id,
        name: "MacBook Air M3",
        description: "For coding and projects",
        targetAmount: 120000,
        currentAmount: 35000,
      },
      {
        userId: vikash._id,
        name: "Campus Placement Preparation",
        description: "Courses and interview prep",
        targetAmount: 25000,
        currentAmount: 15000,
      },

      // Demo User Goals
      {
        userId: demoUser._id,
        name: "Goa Trip",
        description: "Weekend getaway with friends",
        targetAmount: 30000,
        currentAmount: 12000,
      },
    ]);

    // 4. 👥 GROUPS - Indian Social Scenarios
    const groups = await Group.insertMany([
      {
        name: "Mumbai IT Colleagues",
        members: ["Arjun", "Priya", "Rohit", "Amit"],
        balances: new Map([
          ["Arjun", -450],
          ["Priya", 300],
          ["Rohit", 150],
          ["Amit", 0],
        ]),
        expenses: [
          {
            description: "Team Lunch at Trishna",
            amount: 3200,
            paidBy: "Priya",
            splitBetween: ["Arjun", "Priya", "Rohit", "Amit"],
          },
          {
            description: "Office Party Contribution",
            amount: 2000,
            paidBy: "Arjun",
            splitBetween: ["Arjun", "Priya", "Rohit", "Amit"],
          },
        ],
      },
      {
        name: "College Hostel Gang",
        members: ["Vikash", "Sneha", "Karan", "Pooja"],
        balances: new Map([
          ["Vikash", 200],
          ["Sneha", -150],
          ["Karan", -50],
          ["Pooja", 0],
        ]),
        expenses: [
          {
            description: "Mess Bill Split",
            amount: 1600,
            paidBy: "Vikash",
            splitBetween: ["Vikash", "Sneha", "Karan", "Pooja"],
          },
        ],
      },
      {
        name: "Delhi Business Network",
        members: ["Rahul", "Sanjay", "Neha"],
        balances: new Map([
          ["Rahul", 0],
          ["Sanjay", -800],
          ["Neha", 800],
        ]),
        expenses: [
          {
            description: "Client Meeting at ITC Maurya",
            amount: 2400,
            paidBy: "Neha",
            splitBetween: ["Rahul", "Sanjay", "Neha"],
          },
        ],
      },
    ]);

    // 5. 📊 INVESTMENTS - Popular Indian Investment Options
    await Investment.insertMany([
      // Arjun's Investments
      {
        userId: arjun._id,
        name: "Reliance Industries",
        type: "stocks",
        amount: 85000,
        units: 35,
        currentPrice: 2650,
      },
      {
        userId: arjun._id,
        name: "SBI Bluechip Fund",
        type: "mutual funds",
        amount: 125000,
        units: 1750,
        currentPrice: 85.5,
      },
      {
        userId: arjun._id,
        name: "Gold ETF",
        type: "mutual funds",
        amount: 50000,
        units: 8.2,
        currentPrice: 6200,
      },

      // Priya's Investments
      {
        userId: priya._id,
        name: "HDFC Top 100 Fund",
        type: "mutual funds",
        amount: 75000,
        units: 950,
        currentPrice: 92.3,
      },
      {
        userId: priya._id,
        name: "Infosys Ltd",
        type: "stocks",
        amount: 95000,
        units: 55,
        currentPrice: 1850,
      },

      // Rahul's Investments
      {
        userId: rahul._id,
        name: "ICICI Bank",
        type: "stocks",
        amount: 180000,
        units: 145,
        currentPrice: 1285,
      },
      {
        userId: rahul._id,
        name: "Axis Bluechip Fund",
        type: "mutual funds",
        amount: 250000,
        units: 4200,
        currentPrice: 68.5,
      },
      {
        userId: rahul._id,
        name: "PPF Account",
        type: "mutual funds",
        amount: 500000,
        units: 1,
        currentPrice: 500000,
      },

      // Sneha's Investments
      {
        userId: sneha._id,
        name: "ELSS Tax Saver",
        type: "mutual funds",
        amount: 150000,
        units: 2100,
        currentPrice: 78.2,
      },
      {
        userId: sneha._id,
        name: "Apollo Hospitals",
        type: "stocks",
        amount: 120000,
        units: 18,
        currentPrice: 7200,
      },

      // Demo User Investments
      {
        userId: demoUser._id,
        name: "Nifty 50 ETF",
        type: "mutual funds",
        amount: 25000,
        units: 125,
        currentPrice: 225,
      },
    ]);

    // 6. 💳 TRANSACTIONS - Rich Indian Financial Activity
    const currentYear = 2025;
    const transactionsData = [];

    // Generate transactions for the past 6 months for each user
    const months = [4, 5, 6, 7, 8, 9]; // May to September 2025

    // Arjun's Transactions (Mumbai Software Engineer - ₹1.2L salary)
    months.forEach(month => {
      transactionsData.push(
        // Monthly Income
        {
          userId: arjun._id,
          description: "Tech Solutions Pvt Ltd Salary",
          amount: 120000,
          category: "Salary",
          type: "income",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: arjun._id,
          description: "Freelance Web Development",
          amount: 25000,
          category: "Freelance",
          type: "income",
          date: new Date(currentYear, month - 1, 15),
        },

        // Monthly Expenses
        {
          userId: arjun._id,
          description: "Swiggy Food Orders",
          amount: Math.floor(Math.random() * 3000) + 2000,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: arjun._id,
          description: "Big Basket Grocery",
          amount: Math.floor(Math.random() * 4000) + 3000,
          category: "Groceries",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: arjun._id,
          description: "Ola/Uber Rides",
          amount: Math.floor(Math.random() * 2000) + 1500,
          category: "Transportation",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: arjun._id,
          description: "Netflix + Spotify Subscription",
          amount: 1100,
          category: "Entertainment",
          type: "expense",
          date: new Date(currentYear, month - 1, 5),
        },
      );
    });

    // Priya's Transactions (Bangalore Marketing Manager - ₹95K salary)
    months.forEach(month => {
      transactionsData.push(
        // Monthly Income
        {
          userId: priya._id,
          description: "Digital Marketing Agency Salary",
          amount: 95000,
          category: "Salary",
          type: "income",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: priya._id,
          description: "Instagram Influencer Payment",
          amount: 15000,
          category: "Side Income",
          type: "income",
          date: new Date(currentYear, month - 1, 20),
        },

        // Monthly Expenses
        {
          userId: priya._id,
          description: "House Rent - Koramangala",
          amount: 25000,
          category: "Rent",
          type: "expense",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: priya._id,
          description: "Nykaa Beauty Products",
          amount: Math.floor(Math.random() * 3000) + 2000,
          category: "Beauty & Personal Care",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: priya._id,
          description: "Cafe Coffee Day Meetings",
          amount: Math.floor(Math.random() * 1500) + 800,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
      );
    });

    // Rahul's Transactions (Delhi Business Owner - Variable Income)
    months.forEach(month => {
      const businessIncome = Math.floor(Math.random() * 100000) + 150000; // 1.5L to 2.5L
      transactionsData.push(
        // Business Income
        {
          userId: rahul._id,
          description: "Business Revenue - Gupta Enterprises",
          amount: businessIncome,
          category: "Business Income",
          type: "income",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 10) + 1),
        },

        // Business Expenses
        {
          userId: rahul._id,
          description: "Office Rent - Connaught Place",
          amount: 45000,
          category: "Business Expenses",
          type: "expense",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: rahul._id,
          description: "Team Lunch at Bukhara",
          amount: Math.floor(Math.random() * 8000) + 5000,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: rahul._id,
          description: "Family Shopping - DLF Mall",
          amount: Math.floor(Math.random() * 15000) + 10000,
          category: "Family",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
      );
    });

    // Sneha's Transactions (Chennai Doctor - ₹1.8L salary)
    months.forEach(month => {
      transactionsData.push(
        // Medical Income
        {
          userId: sneha._id,
          description: "Apollo Hospitals Salary",
          amount: 180000,
          category: "Medical Salary",
          type: "income",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: sneha._id,
          description: "Private Practice Income",
          amount: Math.floor(Math.random() * 50000) + 30000,
          category: "Private Practice",
          type: "income",
          date: new Date(currentYear, month - 1, 15),
        },

        // Medical Expenses
        {
          userId: sneha._id,
          description: "Medical Books & Journals",
          amount: Math.floor(Math.random() * 5000) + 3000,
          category: "Education",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: sneha._id,
          description: "Saravana Bhavan Meals",
          amount: Math.floor(Math.random() * 2000) + 1200,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: sneha._id,
          description: "Health Insurance Premium",
          amount: 8500,
          category: "Healthcare",
          type: "expense",
          date: new Date(currentYear, month - 1, 10),
        },
      );
    });

    // Vikash's Transactions (Pune Student - Limited Income)
    months.forEach(month => {
      transactionsData.push(
        // Student Income
        {
          userId: vikash._id,
          description: "Monthly Allowance from Family",
          amount: 20000,
          category: "Family Support",
          type: "income",
          date: new Date(currentYear, month - 1, 5),
        },
        {
          userId: vikash._id,
          description: "Part-time Coding Job",
          amount: Math.floor(Math.random() * 8000) + 5000,
          category: "Part-time",
          type: "income",
          date: new Date(currentYear, month - 1, 20),
        },

        // Student Expenses
        {
          userId: vikash._id,
          description: "College Canteen",
          amount: Math.floor(Math.random() * 1500) + 800,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: vikash._id,
          description: "Local Bus Pass",
          amount: 500,
          category: "Transportation",
          type: "expense",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: vikash._id,
          description: "Course Books & Materials",
          amount: Math.floor(Math.random() * 3000) + 2000,
          category: "Education",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
      );
    });

    // Demo User Transactions (For easy testing)
    months.forEach(month => {
      transactionsData.push(
        {
          userId: demoUser._id,
          description: "Software Company Salary",
          amount: 85000,
          category: "Salary",
          type: "income",
          date: new Date(currentYear, month - 1, 1),
        },
        {
          userId: demoUser._id,
          description: "Zomato Food Orders",
          amount: Math.floor(Math.random() * 2000) + 1000,
          category: "Food & Dining",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: demoUser._id,
          description: "Movie Tickets - PVR",
          amount: Math.floor(Math.random() * 800) + 400,
          category: "Entertainment",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
        {
          userId: demoUser._id,
          description: "Auto/Metro Travel",
          amount: Math.floor(Math.random() * 1000) + 500,
          category: "Transportation",
          type: "expense",
          date: new Date(currentYear, month - 1, Math.floor(Math.random() * 28) + 1),
        },
      );
    });

    // Special Transactions - Festival & Seasonal Expenses
    const festivalTransactions = [
      // Diwali Expenses (October)
      {
        userId: arjun._id,
        description: "Diwali Gifts & Sweets",
        amount: 8500,
        category: "Festivals",
        type: "expense",
        date: new Date(2025, 9, 25), // October
      },
      {
        userId: priya._id,
        description: "Diwali Shopping - Ethnic Wear",
        amount: 12000,
        category: "Shopping",
        type: "expense",
        date: new Date(2025, 9, 20),
      },
      {
        userId: rahul._id,
        description: "Diwali Bonus to Employees",
        amount: 50000,
        category: "Business Expenses",
        type: "expense",
        date: new Date(2025, 9, 22),
      },

      // Wedding Season
      {
        userId: sneha._id,
        description: "Cousin's Wedding Gift",
        amount: 11000,
        category: "Family",
        type: "expense",
        date: new Date(2025, 8, 15), // September
      },

      // Monsoon Expenses
      {
        userId: vikash._id,
        description: "Umbrella & Raincoat",
        amount: 800,
        category: "Shopping",
        type: "expense",
        date: new Date(2025, 6, 10), // July
      },
    ];

    // Add all transactions
    await Transaction.insertMany([...transactionsData, ...festivalTransactions]);

    // 7. 📊 SUMMARY STATISTICS
    const totalUsers = users.length;
    const totalTransactions = transactionsData.length + festivalTransactions.length;
    const totalBudgets = 23;
    const totalGoals = 11;
    const totalInvestments = 10;
    const totalGroups = groups.length;

    console.log("🎉 Indian Budget Tracker Database Seeded Successfully!");
    console.log("============================================================");
    console.log(`👥 Users Created: ${totalUsers}`);
    console.log(`💳 Transactions: ${totalTransactions}`);
    console.log(`💰 Budget Categories: ${totalBudgets}`);
    console.log(`🎯 Financial Goals: ${totalGoals}`);
    console.log(`📊 Investments: ${totalInvestments}`);
    console.log(`👥 Groups: ${totalGroups}`);
    console.log("============================================================");
    console.log("");
    console.log("🔐 LOGIN CREDENTIALS:");
    console.log("Email: demo1@example.com | Password: demo123 (Demo User)");
    console.log("Email: arjun.patel@example.com | Password: demo123 (Mumbai Engineer)");
    console.log("Email: priya.sharma@example.com | Password: demo123 (Bangalore Marketing)");
    console.log("Email: rahul.gupta@example.com | Password: demo123 (Delhi Business Owner)");
    console.log("Email: sneha.iyer@example.com | Password: demo123 (Chennai Doctor)");
    console.log("Email: vikash.singh@example.com | Password: demo123 (Pune Student)");
    console.log("");
    console.log("🇮🇳 Features Demonstrated:");
    console.log("• Multi-city Indian users with realistic salaries");
    console.log("• Indian-specific expense categories & amounts");
    console.log("• 6 months of transaction history");
    console.log("• Festival & seasonal expenses");
    console.log("• Popular Indian investment options");
    console.log("• Social group expense splitting");
    console.log("• Diverse financial goals & budgets");
    console.log("");
    console.log("✨ Ready to showcase the Budget Tracker! ✨");

    process.exit(0);
  } catch (err) {
    console.error("🚨 Seeding error:", err);
    process.exit(1);
  }
}

seed();
