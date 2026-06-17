import os

from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from predict_video import predict_video
from predict_image import predict_image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    ext = file.filename.split(".")[-1].lower()

    image_ext = ["jpg", "jpeg", "png", "webp"]
    video_ext = ["mp4", "avi", "mov", "mkv"]

    if ext in image_ext:
        return predict_image(path)

    elif ext in video_ext:
        return predict_video(path)

    return {
        "error": "Unsupported file type"
    }