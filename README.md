<p align="center">
  <h1 align="center">🛡️ FakeShield AI</h1>
  <p align="center">
    <b>Deepfake Detection for Images &amp; Videos — Powered by Deep Learning</b>
  </p>
  <p align="center">
    <img src="https://img.shields.io/badge/Python-3.11-blue?logo=python&logoColor=white" />
    <img src="https://img.shields.io/badge/TensorFlow-2.21-orange?logo=tensorflow&logoColor=white" />
    <img src="https://img.shields.io/badge/FastAPI-latest-009688?logo=fastapi&logoColor=white" />
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" />
  </p>
</p>

---

## 📖 Overview

**FakeShield AI** is a full-stack deepfake detection web application that uses deep learning to classify whether an uploaded image or video is **REAL** or **AI-generated/manipulated (FAKE)**. It provides a confidence score alongside every prediction so users can gauge the model's certainty.

The system ships as two Docker containers — a **FastAPI** backend running TensorFlow models and a **React** frontend served via **nginx** — orchestrated by Docker Compose for one-command deployment.

---

## 🧠 Models & Architecture

### Image Detection Model

| Property | Detail |
|---|---|
| **Base Model** | **ResNet50** (ImageNet pre-trained) |
| **Strategy** | Transfer Learning — frozen CNN backbone + custom classification head |
| **Input Size** | `224 × 224 × 3` (RGB) |
| **Head Layers** | `GlobalAveragePooling2D` → `Dense(128, ReLU)` → `Dense(1, Sigmoid)` |
| **Optimizer** | Adam |
| **Loss Function** | Binary Cross-Entropy |
| **Training** | 5 epochs, batch size 64, EarlyStopping (patience=2, restore best weights) |
| **Output** | Single sigmoid probability — `> 0.5` = FAKE, `≤ 0.5` = REAL |
| **Saved As** | `backend/models/image_model.h5` |

**How it works:**  
Images are resized to 224×224, normalized to [0, 1], and fed through the frozen ResNet50 backbone. The extracted features are globally pooled and passed through a small fully-connected classifier that outputs a fake-probability.

### Video Detection Model

| Property | Detail |
|---|---|
| **Base Model** | **ResNet50** (ImageNet pre-trained) — wrapped in `TimeDistributed` |
| **Strategy** | CNN + LSTM — spatial feature extraction per frame, then temporal sequence modeling |
| **Input Size** | `20 × 224 × 224 × 3` (20 frames, each 224×224 RGB) |
| **Architecture** | `TimeDistributed(ResNet50)` → `TimeDistributed(GAP)` → `LSTM(128)` → `Dropout(0.3)` → `Dense(64, ReLU)` → `Dense(1, Sigmoid)` |
| **Optimizer** | Adam |
| **Loss Function** | Binary Cross-Entropy |
| **Training** | 10 epochs, batch size 4, 80/20 train/test split |
| **Output** | Single sigmoid probability — `> 0.5` = FAKE, `≤ 0.5` = REAL |
| **Saved As** | `backend/models/video_model.h5` |

**How it works:**  
20 frames are extracted from the video (padded with black frames if fewer exist), resized to 224×224, and converted to RGB. Each frame is passed through the frozen ResNet50 to produce a feature vector. The sequence of 20 feature vectors is then fed into an LSTM to learn temporal inconsistencies typical of deepfakes. The LSTM output is classified through dense layers to produce a fake-probability.

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.11** | Runtime |
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **TensorFlow 2.21** | Deep learning framework |
| **Keras 3** | Model definition & training |
| **OpenCV** | Image/video processing & frame extraction |
| **NumPy** | Numerical operations |
| **scikit-learn** | Train/test splitting |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Styling |
| **Axios** | HTTP client for API calls |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **nginx** | Reverse proxy & static file server (production) |

---

## 📁 Project Structure

```
FakeShield2.0/
├── backend/
│   ├── Dockerfile              # Backend container image
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # FastAPI app — routes & CORS
│   ├── predict_image.py        # Image inference pipeline
│   ├── predict_video.py        # Video inference pipeline
│   ├── image_model.py          # ResNet50-based image model definition
│   ├── model.py                # ResNet50+LSTM video model definition
│   ├── train_image.py          # Image model training script
│   ├── train_video.py          # Video model training script
│   ├── data_loader.py          # Video dataset loader (real/fake dirs)
│   ├── frame_extractor.py      # Extracts & preprocesses video frames
│   ├── extract_images.py       # Utility: extract frames from videos as images
│   └── models/                 # Trained model weights (.h5 files)
│       ├── image_model.h5
│       └── video_model.h5
│
├── frontend/
│   ├── Dockerfile              # Multi-stage build (Node → nginx)
│   ├── nginx.conf              # nginx config (SPA routing + API proxy)
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Root component
│       ├── api.js              # Axios API client
│       ├── index.css           # Global styles
│       └── components/
│           └── upload.jsx      # File upload & result display component
│
├── docker-compose.yml          # Orchestrates backend + frontend
├── .gitignore                  # Comprehensive ignore rules
└── README.md                   # ← You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** (for local backend dev)
- **Node.js 20+** (for local frontend dev)
- **Docker & Docker Compose** (for containerized deployment)



| Field | Type | Description |
|---|---|---|
| `file` | `multipart/form-data` | Image (`.jpg`, `.jpeg`, `.png`, `.webp`) or Video (`.mp4`, `.avi`, `.mov`, `.mkv`) |

**Response:**

```json
{
  "result": "FAKE",
  "confidence": 0.9347
}
```

| Field | Type | Description |
|---|---|---|
| `result` | `string` | `"FAKE"` or `"REAL"` |
| `confidence` | `float` | Model's sigmoid output (0.0–1.0). Values > 0.5 = FAKE. |

**Example with cURL:**

```bash
curl -X POST http://localhost:8001/predict \
  -F "file=@path/to/suspect_image.jpg"
```

**Error Response:**

```json
{
  "error": "Unsupported file type"
}
```

---

## 🏋️ Training Your Own Models

### Image Model

1. Organize your dataset:
   ```
   image_dataset/
   ├── train/
   │   ├── real/     # Real images
   │   └── fake/     # Fake/AI-generated images
   └── valid/
       ├── real/
       └── fake/
   ```

2. Run the training script:
   ```bash
   cd backend
   python train_image.py
   ```

3. The trained model will be saved to `models/image_model.h5`.

### Video Model

1. Organize your dataset:
   ```
   dataset/
   ├── real/    # Real video files
   └── fake/    # Deepfake video files
   ```

2. Run the training script:
   ```bash
   cd backend
   python train_video.py
   ```

3. The trained model will be saved as `deepfake_model.h5` (rename to `models/video_model.h5` for the API).

### Extracting Frames from Videos (Utility)

To create an image dataset from video files:

```bash
cd backend
python extract_images.py
```

This reads videos from `dataset/real/` and `dataset/fake/`, extracts every frame, and saves them to `image_dataset/real/` and `image_dataset/fake/`.

---

## 🐳 Docker Architecture

```
┌────────────────────────────────────────────────────┐
│                  Docker Compose                     │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐ │
│  │    Frontend       │    │      Backend          │ │
│  │  (nginx:alpine)   │    │  (python:3.11-slim)   │ │
│  │                   │    │                       │ │
│  │  React SPA        │───▶│  FastAPI + TensorFlow │ │
│  │  Port: 5173 → 80  │/api│  Port: 8001           │ │
│  │                   │    │                       │ │
│  │  Reverse proxy    │    │  Volumes:             │ │
│  │  /api/ → backend  │    │   ./models → /app/    │ │
│  └──────────────────┘    │   ./uploads → /app/   │ │
│                           └───────────────────────┘ │
└────────────────────────────────────────────────────┘
```

- **Frontend** serves the React build via nginx on port **5173** (mapped to container port 80).
- **nginx** reverse-proxies all `/api/*` requests to the backend container on port **8001**.
- **Backend** loads TensorFlow models at startup and exposes the `/predict` endpoint.
- Model weights are **volume-mounted**, not baked into the Docker image.

---

## ⚙️ Environment Variables

| Variable | Service | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Frontend (build-time) | `http://localhost:8001` | Backend API base URL. Set to `/api` in Docker Compose for nginx proxying. |
| `PYTHONUNBUFFERED` | Backend | `1` | Ensures Python output is not buffered (useful for Docker logs). |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is open source. Feel free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/shreyashagrawal00">shreyashagrawal00</a>
</p>
