from sklearn.model_selection import train_test_split

from model import build_model
from data_loader import load_dataset

X, y = load_dataset("../dataset")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = build_model()

model.fit(
    X_train,
    y_train,
    validation_data=(X_test, y_test),
    epochs=10,
    batch_size=4
)

model.save("deepfake_model.h5")

print("Model Saved")