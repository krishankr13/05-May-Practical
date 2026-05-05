const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const cors = require("cors");

const Url = require("./models/Url");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose.connect("mongodb://127.0.0.1:27017/urlshortener")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

// Home route
app.get("/", (req, res) => {
  res.send("URL Shortener API Running...");
});

// Create short URL
app.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "URL required" });
    }

    const shortId = shortid.generate();

    const newUrl = new Url({
      originalUrl,
      shortId
    });

    await newUrl.save();

    console.log("Saved:", newUrl); // debug

    res.json({
      shortUrl: `http://localhost:5000/${shortId}`
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Redirect
app.get("/:shortId", async (req, res) => {
  try {
    console.log("Searching:", req.params.shortId); // debug

    const url = await Url.findOne({ shortId: req.params.shortId });

    if (url) {
      return res.redirect(url.originalUrl);
    } else {
      return res.status(404).send("URL not found");
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});