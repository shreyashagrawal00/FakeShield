import os
import numpy as np

from frame_extractor import extract_frames

def load_dataset(dataset_path):

    videos = []
    labels = []

    real_path = os.path.join(dataset_path, "real")
    fake_path = os.path.join(dataset_path, "fake")

    for file in os.listdir(real_path):

        video = os.path.join(real_path, file)

        videos.append(extract_frames(video))
        labels.append(0)

    for file in os.listdir(fake_path):

        video = os.path.join(fake_path, file)

        videos.append(extract_frames(video))
        labels.append(1)

    return np.array(videos), np.array(labels)