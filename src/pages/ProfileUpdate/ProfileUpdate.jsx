import React, { useContext, useEffect, useState } from "react";
import "./profileupdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

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
  const {setUserData} = useContext(AppContext)

  // 🔹 Fetch existing user data
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setName(data.name);
          if (data.bio) setBio(data.bio);
          if (data.avatar) setPrevImage(data.avatar);
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  // 🔹 Handle image upload to Cloudinary with live progress
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setLoading(true);
    setUploadProgress(0);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "starting11"); // your unsigned preset
    data.append("cloud_name", "dthr9jugh"); // your Cloudinary cloud name

    try {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dthr9jugh/image/upload");

      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      // When upload completes
      xhr.onload = () => {
        const json = JSON.parse(xhr.responseText);
        if (json.secure_url) {
          setUploadedUrl(json.secure_url);
          console.log("Uploaded URL:", json.secure_url);
        } else {
          console.error("Cloudinary upload error:", json);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        console.error("Upload failed!");
        setLoading(false);
      };

      xhr.send(data);
    } catch (err) {
      console.error("Upload failed:", err);
      setLoading(false);
    }
  };

  // 🔹 Handle saving profile to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!uid) {
      alert("User not logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        bio,
        avatar: uploadedUrl || prevImage, // keep old image if new one not uploaded
      });
      alert("✅ Profile updated successfully!");
      const snap= await getDoc(userRef);
      setUserData(snap.data());
      navigate('/chat');
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

          <label htmlFor="avatar" className="upload-label">
            <input
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
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

          {/* Progress Bar */}
          {loading && (
            <div className="progress-bar">
              <div
                className="progress"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p>{uploadProgress}%</p>
            </div>
          )}

          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your Name"
            required
          />

          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
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
