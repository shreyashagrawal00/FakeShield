import axios from "axios";

export const uploadVideo = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await axios.post(
    "http://127.0.0.1:8001/predict",
    formData
  );

  return response.data;
};