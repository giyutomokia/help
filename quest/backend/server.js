const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serving images

// Image upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Ensure the directories exist
const ensureDirectoriesExist = () => {
  const uploadDir = path.join(__dirname, "uploads");
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
};

// Route to get the email layout template (HTML)
app.get("/getEmailLayout", (req, res) => {
  const layoutPath = path.join(__dirname, "templates", "layout.html");
  fs.readFile(layoutPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading layout:", err);
      return res.status(500).send("Failed to load email layout.");
    }
    res.send(data);
  });
});

// Route to upload an image and return the URL
app.post("/uploadImage", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Route to save the email configuration
app.post("/uploadEmailConfig", (req, res) => {
  const emailConfig = req.body;
  const dataDir = path.join(__dirname, "data");
  const filePath = path.join(dataDir, "emailConfig.json");

  ensureDirectoriesExist(); // Ensure directories exist

  fs.writeFile(filePath, JSON.stringify(emailConfig, null, 2), (err) => {
    if (err) {
      console.error("Error saving config:", err);
      return res.status(500).send("Failed to save email configuration.");
    }
    res.send("Email configuration saved.");
  });
});

// Route to render and download the template
app.post("/renderAndDownloadTemplate", (req, res) => {
  const { title, content, footer, imageUrls } = req.body;

  const layoutPath = path.join(__dirname, "templates", "layout.html");
  fs.readFile(layoutPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading layout:", err);
      return res.status(500).send("Failed to load email layout.");
    }

    // Replace placeholders with dynamic content
    const renderedTemplate = data
      .replace("{{title}}", title)
      .replace("{{content}}", content)
      .replace("{{footer}}", footer)
      .replace(
        "{{#imageUrls}}{{.}}{{/imageUrls}}",
        imageUrls
          ? imageUrls.map((url) => {
              return `<div><img src="${url}" alt="Uploaded Image" style="max-width: 100%; margin-top: 10px;" /></div>`;
            }).join("")
          : ""
      );

    res.setHeader("Content-Disposition", "attachment; filename=email_template.html");
    res.setHeader("Content-Type", "text/html");
    res.send(renderedTemplate);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
