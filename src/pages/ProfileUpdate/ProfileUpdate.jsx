import React, { useContext, useEffect, useState } from "react";
import "./Profileupdate.css";
import assets from "../../assets/assets";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

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
        } else {
          console.error(response);
        }
        setLoading(false);
      };

      xhr.onerror = () => {
        console.error("Upload failed!");
        setLoading(false);
      };

      xhr.send(formData);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uid) return;

    try {
      const avatarUrl = uploadedUrl || prevImage;
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { name, bio, avatar: avatarUrl });
      const updatedSnap = await getDoc(userRef);
      setUserData(updatedSnap.data());
      navigate("/chat");
    } catch (err) {
      console.error(err);
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
              accept="image/png, image/jpeg"
              hidden
              onChange={handleImageChange}
            />
            <img
              src={uploadedUrl || prevImage || assets.avatar_icon}
              alt="avatar"
              className="avatar-preview"
            />
            {loading ? "Uploading..." : "Upload Profile Image"}
          </label>

          {loading && (
            <div className="progress-bar">
              <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
              <p>{uploadProgress}%</p>
            </div>
          )}

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
