const upload = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "starting11"); // replace with your preset
    formData.append("cloud_name", "dthr9jugh"); // replace with your cloud name

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dthr9jugh/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("Cloudinary upload failed");

    const data = await res.json();
    return data.secure_url; // ✅ URL of uploaded image
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export default upload;

