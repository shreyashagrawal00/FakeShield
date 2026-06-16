from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    TimeDistributed,
    GlobalAveragePooling2D,
    LSTM,
    Dense,
    Dropout
)

from tensorflow.keras.applications import ResNet50

def build_model():

    cnn = ResNet50(
        weights="imagenet",
        include_top=False,
        input_shape=(224,224,3)
    )

    cnn.trainable = False

    model = Sequential([

        TimeDistributed(
            cnn,
            input_shape=(20,224,224,3)
        ),

        TimeDistributed(
            GlobalAveragePooling2D()
        ),

        LSTM(128),

        Dropout(0.3),

        Dense(64, activation="relu"),

        Dense(1, activation="sigmoid")
    ])

    model.compile(
        optimizer="adam",
        loss="binary_crossentropy",
        metrics=["accuracy"]
    )

    return model