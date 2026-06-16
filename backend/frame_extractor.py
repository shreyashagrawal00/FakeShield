import cv2
import numpy as np

IMG_SIZE = 224
MAX_FRAMES = 20

def extract_frames(video_path):

    cap = cv2.VideoCapture(video_path)

    frames = []

    while len(frames) < MAX_FRAMES:

        ret, frame = cap.read()

        if not ret:
            break

        frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        frames.append(frame)

    cap.release()

    while len(frames) < MAX_FRAMES:
        frames.append(np.zeros((IMG_SIZE, IMG_SIZE, 3)))

    return np.array(frames)