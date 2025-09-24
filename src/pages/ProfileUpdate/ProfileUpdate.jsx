import React, { useState } from "react";
import "./profileupdate.css";
import assets from "../../assets/assets";

const ProfileUpdate = () => {
  const [image, setImage] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "starting");
    data.append("cloud_name", "dthr9jugh");

    setLoading(true);
    try {
        const res = await fetch(
        "https://api.cloudinary.com/v1_1/dthr9jugh/image/upload",
        {
            method: "POST",
            body: data,
        }
        );
        const json = await res.json();
        setUploadedUrl(json.url);
        console.log("Uploaded URL:", json.url);
    } catch (err) {
        console.error("Upload failed:", err);
    } finally {
        setLoading(false);
    }
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted with image URL:", uploadedUrl);
    };

    return (
    <div className="profile">
        <div className="profileContainer">
        <form onSubmit={handleSubmit}>
            <h3>Profile Details</h3>

            <label htmlFor="avatar">
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
                    : image
                    ? URL.createObjectURL(image)
                    : assets.avatar_icon
                }
                alt="avatar"
            />
            {loading ? "Uploading..." : "Upload Profile Image"}
            </label>

            <input type="text" placeholder="First Name" required />
            <textarea placeholder="Write profile bio" required></textarea>

            <button type="submit">Save</button>
        </form>

        <img
            className="profilePic"
            src={uploadedUrl ? uploadedUrl : assets.logo_icon}
            alt="Profile"
        />
        </div>
    </div>
    );
};

export default ProfileUpdate;
