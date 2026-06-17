from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.applications import ResNet50

def build_image_model():

    base = ResNet50(
        weights="imagenet",
        include_top=False,
        input_shape=(224,224,3)
    )

    base.trainable = False

    model = Sequential([
        base,
        GlobalAveragePooling2D(),
        Dense(128, activation="relu"),
        Dense(1, activation="sigmoid")
    ])

    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"]
    )

    return model