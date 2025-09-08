// seed.js
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
const MONGO_URI = process.env.MONGO_URI ;
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected ✅");

    // Clear existing data
    await Promise.all([
      User.deleteMany(),
      Budget.deleteMany(),
      Goal.deleteMany(),
      Group.deleteMany(),
      Investment.deleteMany(),
      Transaction.deleteMany(),
    ]);

    // 1. Users
    const hashed1 = await bcrypt.hash("demo123", 10);  // plaintext password: ankit123
    const users = await User.insertMany([
      {
        username: "Ankit Sharma",
        email: "demo1@example.com",
        password: hashed1,
      },
      {
        username: "Priya Verma",
        email: "demo2@example.com",
        password: hashed1,
      },
    ]);

    const [ankit, priya] = users;

    // 2. Budgets
    await Budget.insertMany([
      { userId: ankit._id, category: "Food", limit: 10000 },
      { userId: ankit._id, category: "Travel", limit: 15000 },
      { userId: priya._id, category: "Shopping", limit: 8000 },
      { userId: priya._id, category: "Rent", limit: 20000 },
    ]);

    // 3. Goals
    await Goal.insertMany([
      {
        userId: ankit._id,
        name: "Goa Vacation",
        description: "Trip with college friends",
        targetAmount: 30000,
        currentAmount: 5000,
      },
      {
        userId: priya._id,
        name: "MacBook Pro",
        description: "Saving for new laptop",
        targetAmount: 120000,
        currentAmount: 45000,
      },
    ]);

    // 4. Groups
    const group = new Group({
      name: "Flatmates",
      members: ["Ankit", "Priya", "Rohit"],
      balances: new Map([
        ["Ankit", 0],
        ["Priya", 0],
        ["Rohit", 0],
      ]),
      expenses: [],
    });

    const expense1 = {
      description: "Dinner at Biryani House",
      amount: 1500,
      paidBy: "Ankit",
      splitBetween: ["Ankit", "Priya", "Rohit"],
    };
    group.expenses.push(expense1);
    group.applyExpenseToBalances(expense1);

    await group.save();

    // 5. Investments
    await Investment.insertMany([
      {
        userId: ankit._id,
        name: "Reliance Industries",
        type: "stocks",
        amount: 50000,
        units: 25,
        currentPrice: 2300,
      },
      {
        userId: priya._id,
        name: "SBI Mutual Fund",
        type: "mutual funds",
        amount: 30000,
        units: 120,
        currentPrice: 280,
      },
    ]);

    // 6. Transactions
    await Transaction.insertMany([
      {
        userId: ankit._id,
        description: "Salary Credit",
        amount: 60000,
        category: "Income",
        type: "income",
        date: new Date("2025-08-01"),
      },
      {
        userId: ankit._id,
        description: "Zomato Order",
        amount: 1200,
        category: "Food",
        type: "expense",
        date: new Date("2025-08-05"),
      },
      {
        userId: priya._id,
        description: "Freelance Payment",
        amount: 25000,
        category: "Income",
        type: "income",
        date: new Date("2025-08-02"),
      },
      {
        userId: priya._id,
        description: "Amazon Shopping",
        amount: 3500,
        category: "Shopping",
        type: "expense",
        date: new Date("2025-08-10"),
      },
    ]);

    console.log("✅ Database seeded successfully");
    process.exit();
  } catch (err) {
    console.error("Seeding error ❌", err);
    process.exit(1);
  }
}

seed();
