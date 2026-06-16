import os

from fastapi import FastAPI
from fastapi import UploadFile

from predict import predict_video

app = FastAPI()

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/predict")
async def predict(file: UploadFile):

    path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(path, "wb") as f:
        f.write(await file.read())

    result = predict_video(path)

    return result