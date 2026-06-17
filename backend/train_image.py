import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping

from image_model import build_image_model

IMG_SIZE = (224, 224)
BATCH_SIZE = 64

train_ds = tf.keras.utils.image_dataset_from_directory(
    "../image_dataset/train",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary"
).prefetch(tf.data.AUTOTUNE)

valid_ds = tf.keras.utils.image_dataset_from_directory(
    "../image_dataset/valid",
    image_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    label_mode="binary"
).prefetch(tf.data.AUTOTUNE)

model = build_image_model()

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=2,
    restore_best_weights=True
)

history = model.fit(
    train_ds,
    validation_data=valid_ds,
    epochs=5,
    callbacks=[early_stop]
)

model.save("models/image_model.h5")

print("Image Model Saved Successfully")