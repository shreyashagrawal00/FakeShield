import numpy as np

from tensorflow.keras.models import load_model

from frame_extractor import extract_frames

model = load_model("deepfake_model.h5")

def predict_video(video_path):

    frames = extract_frames(video_path)

    frames = np.expand_dims(frames, axis=0)

    prediction = model.predict(frames)[0][0]

    return {
        "result": "FAKE" if prediction > 0.5 else "REAL",
        "confidence": float(prediction)
    }