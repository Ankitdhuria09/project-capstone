import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle, Target, PiggyBank, TrendingUp } from "lucide-react";
import api from "../lib/api";

const OnboardingSteps = {
  WELCOME: 0,
  GOALS: 1,
  BUDGET: 2,
  COMPLETE: 3
};

function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(OnboardingSteps.WELCOME);
  const [userData, setUserData] = useState({
    monthlyIncome: '',
    primaryGoal: '',
    budgetCategories: {
      food: '',
      transport: '',
      entertainment: '',
      shopping: ''
    }
  });
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (currentStep < OnboardingSteps.COMPLETE) {
      setCurrentStep(currentStep + 1);
    }
  };

const handleComplete = async () => {
  setLoading(true);
  try {
    const userId = localStorage.getItem('userId'); // or from auth context
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

   const budgetPromises = Object.entries(userData.budgetCategories)
  .filter(([_, limit]) => limit && parseFloat(limit) > 0)
  .map(([category, limit]) =>
    api.post('/budgets', {
      userId: userId, // Add this line
      category: category.charAt(0).toUpperCase() + category.slice(1),
      limit: parseFloat(limit)
    })
  );
    if (userData.primaryGoal && userData.monthlyIncome) {
      const goalAmount = parseFloat(userData.monthlyIncome) * 3;
      budgetPromises.push(
        api.post('/goals', {
          userId: userId, // Add userId if required by the Goals model
          name: 'Emergency Fund',
          targetAmount: goalAmount,
          description: 'Build an emergency fund covering 3 months of expenses',
          category: 'emergency'
        })
      );
    }

    await Promise.all(budgetPromises);
    localStorage.setItem('onboardingComplete', 'true');
    onComplete();
  } catch (error) {
    console.error('Error response:', error.response?.data || error.message);
    console.error('Error status:', error.response?.status);
  } finally {
    setLoading(false);
  }
};



  const steps = [
    {
      title: "Welcome to Budget Tracker! 👋",
      subtitle: "Let's get you set up for financial success",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-600 text-lg leading-relaxed">
            We'll help you set up your budget, create financial goals, and take control of your money in just a few steps.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Set Goals</h3>
              <p className="text-sm text-blue-700">Define your financial targets</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <PiggyBank className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Track Spending</h3>
              <p className="text-sm text-green-700">Monitor your expenses</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Grow Wealth</h3>
              <p className="text-sm text-purple-700">Build your financial future</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Tell us about your income 💼",
      subtitle: "This helps us create realistic budgets for you",
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your monthly income? (₹)
            </label>
            <input
              type="number"
              value={userData.monthlyIncome}
              onChange={(e) => setUserData({...userData, monthlyIncome: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your primary financial goal?
            </label>
            <select
              value={userData.primaryGoal}
              onChange={(e) => setUserData({...userData, primaryGoal: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a goal</option>
              <option value="emergency">Build emergency fund</option>
              <option value="vacation">Save for vacation</option>
              <option value="house">Buy a house</option>
              <option value="car">Buy a car</option>
              <option value="education">Education/Course</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: "Set up your budget 📊",
      subtitle: "Allocate your income across different categories",
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Based on your monthly income of ₹{userData.monthlyIncome || '0'}, here are some suggested allocations:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'food', label: 'Food & Dining', suggested: Math.round(parseFloat(userData.monthlyIncome || 0) * 0.25) },
              { key: 'transport', label: 'Transportation', suggested: Math.round(parseFloat(userData.monthlyIncome || 0) * 0.15) },
              { key: 'entertainment', label: 'Entertainment', suggested: Math.round(parseFloat(userData.monthlyIncome || 0) * 0.1) },
              { key: 'shopping', label: 'Shopping', suggested: Math.round(parseFloat(userData.monthlyIncome || 0) * 0.1) }
            ].map(({ key, label, suggested }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={userData.budgetCategories[key]}
                    onChange={(e) => setUserData({
                      ...userData,
                      budgetCategories: {
                        ...userData.budgetCategories,
                        [key]: e.target.value
                      }
                    })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={suggested.toString()}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            💡 Tip: Try to save at least 20% of your income for future goals!
          </p>
        </div>
      )
    },
    {
      title: "You're all set! 🎉",
      subtitle: "Welcome to your financial journey",
      content: (
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">✨</div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Congratulations! Your budget is ready.
            </h3>
            <p className="text-green-700">
              We've created your initial budgets and goals. You can always adjust them later.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 bg-blue-50 rounded-lg text-left">
              <h4 className="font-semibold text-blue-900 mb-2">Next steps:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Add your first transaction</li>
                <li>• Set up investment tracking</li>
                <li>• Explore analytics</li>
              </ul>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-left">
              <h4 className="font-semibold text-purple-900 mb-2">Pro tips:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Check your dashboard daily</li>
                <li>• Review budgets weekly</li>
                <li>• Update goals monthly</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress Bar */}
        <div className="bg-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600 mb-8">
              {currentStepData.subtitle}
            </p>

            <div className="mb-8">
              {currentStepData.content}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {currentStep > 0 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    ← Back
                  </button>
                )}
              </div>

              <div>
                {currentStep < OnboardingSteps.COMPLETE ? (
                  <button
                    onClick={handleNext}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Setting up...
                      </>
                    ) : (
                      <>
                        Start Using Budget Tracker
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Onboarding;