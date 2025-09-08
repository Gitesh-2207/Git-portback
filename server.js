require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Setup (Allow frontend + localhost for dev)
const corsOptions = {
  origin: [
    process.env.CLIENT_ORIGIN,      // e.g., https://your-portfolio.vercel.app
    "http://localhost:5500",        // local testing
    "http://127.0.0.1:5500",
    "http://localhost:3000"         // react dev server (optional)
  ],
  methods: ["GET", "POST"],
  credentials: true
};
app.use(cors(corsOptions));

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // stop server if DB fails
  });

// ✅ Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("sContact", contactSchema);

// ✅ Contact Route (Save Message)
app.post("/contact", async (req, res) => {
  try {
    console.log(" Incoming form data:", req.body);

    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).send("❌ All fields are required");
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res.status(201).send("✅ Message saved to MongoDB!");
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    res.status(500).send("Server error, please try again later.");
  }
});

// ✅ Get All Messages (optional)
app.get("/contact", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send("❌ Failed to fetch messages.");
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
