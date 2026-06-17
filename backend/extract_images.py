import cv2
import os

REAL_VIDEO = "../dataset/real"
FAKE_VIDEO = "../dataset/fake"

REAL_IMG = "../image_dataset/real"
FAKE_IMG = "../image_dataset/fake"

os.makedirs(REAL_IMG, exist_ok=True)
os.makedirs(FAKE_IMG, exist_ok=True)

# Real videos
count = 0

for file in os.listdir(REAL_VIDEO):

    path = os.path.join(REAL_VIDEO, file)

    cap = cv2.VideoCapture(path)

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        cv2.imwrite(
            f"{REAL_IMG}/real_{count}.jpg",
            frame
        )

        count += 1

    cap.release()

# Fake videos
count = 0

for file in os.listdir(FAKE_VIDEO):

    path = os.path.join(FAKE_VIDEO, file)

    cap = cv2.VideoCapture(path)

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        cv2.imwrite(
            f"{FAKE_IMG}/fake_{count}.jpg",
            frame
        )

        count += 1

    cap.release()

print("Images extracted successfully")