import { useState } from "react";
import { uploadVideo } from "../api";

function Upload() {

  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {

    const file = e.target.files[0];

    const data = await uploadVideo(file);

    setResult(data);
  };

  return (
    <div>

      <input
        type="file"
        accept="video/*"
        onChange={handleUpload}
      />

      {result && (
        <div>
          <h2>{result.result}</h2>
          <p>
            Confidence:
            {result.confidence}
          </p>
        </div>
      )}

    </div>
  );
}

export default Upload;