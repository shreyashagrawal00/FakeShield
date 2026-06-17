import cv2
import numpy as np
from tensorflow.keras.models import load_model

model = load_model("models/image_model.h5")

def predict_image(image_path):

    img = cv2.imread(image_path)

    img = cv2.resize(img, (224,224))

    img = img / 255.0

    img = np.expand_dims(img, axis=0)

    prediction = model.predict(img)[0][0]

    return {
        "result": "FAKE" if prediction > 0.5 else "REAL",
        "confidence": float(prediction)
    }