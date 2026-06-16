import axios from "axios";

export const uploadVideo = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    "http://localhost:8000/predict",
    formData
  );

  return response.data;
};