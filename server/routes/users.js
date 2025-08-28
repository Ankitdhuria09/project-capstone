import express from "express";
const router = express.Router();

// just for testing
router.post("/signup", (req, res) => {
  console.log("✅ Signup route hit!", req.body);
  res.json({ message: "Signup route working" });
});

router.post("/login", (req, res) => {
  console.log("✅ Login route hit!", req.body);
  res.json({ message: "Login route working" });
});

export default router;
