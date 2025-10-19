import React, { useContext, useEffect, useState } from "react";
import "./profileupdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import upload from "../../lib/upload"; // ✅ Reuse centralized Cloudinary uploader

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  // 🔹 Fetch existing user data
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setBio(data.bio || "");
          setPrevImage(data.avatar || "");
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  // 🔹 Handle avatar selection + upload to Cloudinary (with progress)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // ✅ Manual progress tracking using XMLHttpRequest for Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "chat-app"); // replace with your Cloudinary preset
      formData.append("cloud_name", "dthr9jugh"); // replace with your Cloudinary name

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/dthr9jugh/image/upload`);

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onload = () => {
        const response = JSON.parse(xhr.responseText);
        if (response.secure_url) {
          setUploadedUrl(response.secure_url);
          console.log("✅ Uploaded Avatar URL:", response.secure_url);
        } else {
          console.error("❌ Cloudinary upload error:", response);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        console.error("❌ Upload failed!");
        setLoading(false);
      };

      xhr.send(formData);
    } catch (err) {
      console.error("Upload failed:", err);
      setLoading(false);
    }
  };

  // 🔹 Handle saving profile info to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid) {
      alert("User not logged in.");
      return;
    }

    try {
      const avatarUrl = uploadedUrl || prevImage;
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        name,
        bio,
        avatar: avatarUrl,
      });

      // Update global context
      const updatedSnap = await getDoc(userRef);
      setUserData(updatedSnap.data());

      alert("✅ Profile updated successfully!");
      navigate("/chat");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("❌ Failed to update profile.");
    }
  };

  return (
    <div className="profile">
      <div className="profileContainer">
        <form onSubmit={handleSubmit}>
          <h3>Profile Details</h3>

          {/* Avatar Upload */}
          <label htmlFor="avatar" className="upload-label">
            <input
              type="file"
              id="avatar"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleImageChange}
            />
            <img
              src={
                uploadedUrl
                  ? uploadedUrl
                  : prevImage
                  ? prevImage
                  : assets.avatar_icon
              }
              alt="avatar"
              className="avatar-preview"
            />
            {loading ? "Uploading..." : "Upload Profile Image"}
          </label>

          {/* Upload Progress Bar */}
          {loading && (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p>{uploadProgress}%</p>
            </div>
          )}

          {/* User Info */}
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <textarea
            placeholder="Write profile bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          ></textarea>

          <button type="submit" disabled={loading}>
            {loading ? "Uploading..." : "Save"}
          </button>
        </form>

        <img
          className="profilePic"
          src={uploadedUrl || prevImage || assets.logo_icon}
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
