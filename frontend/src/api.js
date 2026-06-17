import axios from "axios";

// In Docker/production, set VITE_API_URL as a build arg.
// Falls back to localhost for local development.
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_BASE}/predict`,
    formData
  );

  return response.data;
};

// Backward compatibility alias
export const uploadVideo = uploadMedia;