"use client";
import axios from "axios";
import { useParams } from "next/navigation";
import React, { ChangeEvent, useState } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  marginBottom: "15px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  background: "#fff",
  color: "#222",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 500,
  marginBottom: "2px",
  fontSize: "1.1rem",
  color: "#234e52",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  color: "#234e52",
  fontWeight: 700,
  marginBottom: "1.2rem",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #bbb",
  padding: "2rem",
  borderRadius: "10px",
  minHeight: "350px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export default function AddCoursePage() {
  const params = useParams();
  const userId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [topic, setTopic] = useState("fkdfk");
  const [level, setLevel] = useState("BEGINNER");
  const [title, setTitle] = useState("kfdkf");
  const [price, setPrice] = useState(0.0);
  const [description, setDescription] = useState("ksdk");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      setMessage("");

      // NOTE: Replace this with actual upload logic or use a mock URL
      const coverPhotoUrl = "https://dummyimage.com/600x400";

      const body = {
        title,
        description,
        price: 34.5,
        coverPhotoUrl,
        level,
        instructorId: userId,
      };

      console.log(body);

      const response = await axios.post(
        "http://localhost:5001/api/courses/create/",
        body
      );
      console.log(response);

      if (response.status === 201) {
        setMessage("✅ Course created successfully!");
        setTitle("");
        setDescription("");
        setPrice(0);
        setLevel("");
        setTopic("");
        setCoverFile(null);
        setCoverPreview(null);
      } else {
        setMessage("❌ Failed to create course.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Error creating course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f2f2f2" }}>
      {/* Left Section */}
      <div style={{ flex: 1.7, padding: "4rem 2.5rem 0 3rem" }}>
        <h1 style={sectionTitleStyle}>Create a course</h1>
        <p style={{ fontSize: "1.4rem", marginBottom: "1rem", color: "#222" }}>
          Follow the steps to create a course.
        </p>
        <ul style={{ color: "#333", fontSize: "1.15rem", lineHeight: "2" }}>
          <li>Select a topic for your course</li>
          <li>Select course level</li>
          <li>Input Price</li>
          <li>Input Title</li>
          <li>Write a description</li>
          <li>Upload a cover</li>
          <li>Write what one will learn from the course</li>
          <li>Upload lessons</li>
          <li>Deploy course</li>
        </ul>
      </div>

      {/* Center Form */}
      <div
        style={{
          flex: 2.2,
          padding: "4rem 2rem 0 2rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <form style={{ marginBottom: "2rem", width: "100%" }}>
          <div>
            <label style={labelStyle}>Topic</label>
            <select
              style={inputStyle}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Select</option>
              <option value="Math">Math</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Course Level</label>
            <select
              style={inputStyle}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">Select</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Course Title</label>
            <input
              style={inputStyle}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter course title"
            />
          </div>
          <div>
            <label style={labelStyle}>Price</label>
            <input
              style={inputStyle}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="25"
              min="0"
            />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description"
            />
          </div>
          <button
            type="button"
            onClick={handleCreateCourse}
            style={{
              background: "#15616d",
              color: "#fff",
              fontWeight: 600,
              padding: "0.7rem 2.5rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "1.15rem",
              marginTop: "10px",
            }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Course"}
          </button>
          {message && (
            <p style={{ marginTop: "1rem", color: "#15616d", fontWeight: 600 }}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Right Preview Card */}
      <div
        style={{
          flex: 2,
          padding: "3.5rem 2rem 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <div style={cardStyle}>
          <div
            style={{ marginBottom: "1rem", width: "100%", textAlign: "center" }}
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover Preview"
                style={{
                  width: "100%",
                  maxHeight: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.11)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "110px",
                  background: "#e0e0e0",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#aaa",
                  fontWeight: 500,
                }}
              >
                Cover Image Preview
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              id="cover-upload"
              onChange={handleCoverChange}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => document.getElementById("cover-upload")?.click()}
              style={{
                marginTop: "0.75rem",
                background: "#15616d",
                color: "#fff",
                fontWeight: 600,
                padding: "0.5rem 1.3rem",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "1.04rem",
              }}
            >
              Upload Cover Photo
            </button>
          </div>
          <div
            style={{ marginBottom: "0.7rem", fontSize: "1rem", color: "#888" }}
          >
            {level || "Course Level"}
          </div>
          <h2
            style={{
              fontSize: "1.4rem",
              margin: "0 0 1rem 0",
              fontWeight: 600,
              color: "#222",
            }}
          >
            {title || "Please input a heading for your course"}
          </h2>
          <div
            style={{ color: "#444", fontWeight: 600, marginBottom: "0.3em" }}
          >
            Your Name Here
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "0.99rem",
              marginBottom: "0.65em",
            }}
          >
            University Name
          </div>
          <div
            style={{
              color: "#888",
              fontSize: "0.99rem",
              marginBottom: "1.3em",
            }}
          >
            200 followers
          </div>
          <div style={{ color: "#2a2", fontWeight: 700, fontSize: "1.15rem" }}>
            From £{price || "25"}
          </div>
          <button
            disabled
            style={{
              marginTop: "1em",
              padding: "0.6em 1.4em",
              borderRadius: "5px",
              border: "1px solid #bbb",
              color: "#555",
              background: "#ececec",
              fontWeight: 500,
              fontSize: "1.1rem",
              cursor: "not-allowed",
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
