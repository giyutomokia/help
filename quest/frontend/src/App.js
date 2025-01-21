import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [template, setTemplate] = useState(""); // Initial template layout
  const [title, setTitle] = useState("Welcome to Email Builder!");
  const [content, setContent] = useState("Edit this content...");
  const [footer, setFooter] = useState("This is the footer.");
  const [imageUrls, setImageUrls] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Fetch initial email layout template from backend
    axios
      .get("/getEmailLayout")
      .then((response) => setTemplate(response.data))
      .catch((error) => console.error("Error loading template:", error));
  }, []);

  // Function to update email content in preview
  const getRenderedTemplate = () => {
    return template
      .replace("{{title}}", title)
      .replace("{{content}}", content)
      .replace("{{footer}}", footer)
      .replace(
        "{{#imageUrls}}{{.}}{{/imageUrls}}",
        imageUrls
          .map((url) => {
            return `<img src="${url}" alt="Uploaded Image" />`; // Fix image rendering here
          })
          .join("") // Join all image URLs into a single string
      );
  };

  // Save email template configuration
  const handleSave = () => {
    const emailConfig = { title, content, footer, imageUrls };
    axios
      .post("/uploadEmailConfig", emailConfig)
      .then(() => {
        setSaved(true);
        alert("Template saved successfully!");
      })
      .catch((error) => console.error("Error saving template:", error));
  };

  // Handle image upload and update image list
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/uploadImage", formData)
      .then((response) => setImageUrls([...imageUrls, response.data.imageUrl])) // Update image list
      .catch((error) => console.error("Error uploading image:", error));
  };

  // Download the rendered HTML email template
  const handleDownload = () => {
    axios
      .post(
        "/renderAndDownloadTemplate",
        { title, content, footer, imageUrls },
        { responseType: "blob" }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "email_template.html");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => console.error("Error downloading template:", error));
  };

  return (
    <div className="app-container">
      <h1>Email Builder</h1>
      <div className="editor-container">
        <div className="editor-panel">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title"
          />
          <label>Content</label>
          <textarea
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter content"
          ></textarea>
          <label>Footer</label>
          <input
            type="text"
            value={footer}
            onChange={(e) => setFooter(e.target.value)}
            placeholder="Enter footer"
          />
          <label>Upload Image</label>
          <input type="file" onChange={handleImageUpload} />
          <div className="button-group">
            <button onClick={handleSave} className="btn save-btn">
              Save Template
            </button>
            <button onClick={handleDownload} className="btn download-btn">
              Download Template
            </button>
          </div>
        </div>
        <div className="preview-panel">
          <h2>Live Preview</h2>
          <div
            className="email-preview"
            dangerouslySetInnerHTML={{
              __html: getRenderedTemplate(),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default App;
