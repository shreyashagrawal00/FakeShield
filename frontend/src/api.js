import axios from "axios";

export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    "http://127.0.0.1:8001/predict",
    formData
  );

  return response.data;
};

// Backward compatibility alias
export const uploadVideo = uploadMedia;